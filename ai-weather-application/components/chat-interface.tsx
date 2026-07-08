"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAnonymousSession } from "@/hooks/use-anonymous-session";

interface AgentStep {
  step: string;
  content: string;
  tool?: string;
  input?: any;
  output?: string;
}

interface Message {
  id: string;
  content: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  weatherData?: any;
  agentSteps?: AgentStep[];
}

const STEP_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  START: { icon: "play_circle", label: "Start", color: "text-green-400" },
  PLAN: { icon: "psychology", label: "Planning", color: "text-blue-400" },
  TOOL: { icon: "build", label: "Tool Call", color: "text-amber-400" },
  TOOL_RESPONSE: { icon: "database", label: "Tool Response", color: "text-emerald-400" },
  OBSERVATION: { icon: "visibility", label: "Observation", color: "text-purple-400" },
  OUTPUT: { icon: "task_alt", label: "Output", color: "text-secondary" },
};

export function ChatInterface() {
  const { sessionId, isReady } = useAnonymousSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [liveSteps, setLiveSteps] = useState<AgentStep[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, liveSteps, scrollToBottom]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isReady || !sessionId || isLoading) return;

    const userText = input;
    setInput("");
    setIsLoading(true);
    setLiveSteps([]);

    const optimisticUserMsg: Message = { id: Date.now().toString(), content: userText, role: "USER" };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: userText }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      if (data.success && data.aiMessage) {
        const aiMsg: Message = {
          ...data.aiMessage,
          agentSteps: data.agentSteps || [],
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, something went wrong. Please try again.",
        role: "ASSISTANT",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setLiveSteps([]);
    }
  };

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col">
      {/* Chat Canvas */}
      <div 
        ref={chatContainerRef}
        className="absolute inset-0 overflow-y-auto no-scrollbar px-gutter pb-[140px] pt-stack-lg"
      >
        <div className="w-full max-w-3xl mx-auto flex flex-col justify-end min-h-full">
          
          {/* Empty state — vertically centered */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-6 text-center h-full min-h-[50vh] pb-20">
              <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(1,113,185,0.2)]">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
              </div>
              <div>
                <h2 className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md text-on-surface mb-2 font-bold">Aether Weather AI</h2>
                <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-md mx-auto px-4">
                  Ask me about the weather anywhere in the world. Try &quot;What&apos;s the weather in Tokyo?&quot;
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex flex-col gap-stack-xl w-full justify-end flex-1">
            {messages.map((msg, index) => (
            msg.role === "USER" ? (
              <div key={msg.id} className="flex justify-end w-full animate-slide-up">
                <div className="max-w-[95%] md:max-w-[80%] bg-linear-to-br from-inverse-primary to-primary-container text-white px-5 md:px-6 py-3 md:py-4 rounded-2xl rounded-tr-sm shadow-lg font-body-lg text-body-md md:text-body-lg">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex flex-col w-full animate-slide-up" style={{ animationDelay: "100ms" }}>
                <div className="flex items-start gap-3 md:gap-4 w-full">
                  <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary/30 shrink-0 mt-1 hidden md:flex">
                    <span className="material-symbols-outlined text-primary text-sm">cloud</span>
                  </div>
                  <div className="flex flex-col w-full gap-stack-sm md:gap-stack-md max-w-full">

                    {/* Agent Steps Trace */}
                    {msg.agentSteps && msg.agentSteps.length > 0 && (
                      <AgentStepTrace steps={msg.agentSteps} />
                    )}

                    {/* Text Response */}
                    <div className="glass-panel px-4 md:px-6 py-4 md:py-5 rounded-2xl md:rounded-tl-sm w-full font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface">
                      {msg.content}
                    </div>

                    {/* Weather Card & Forecast */}
                    {msg.weatherData && (
                      <WeatherCard data={msg.weatherData} />
                    )}
                  </div>
                </div>
              </div>
            )
          ))}
              {/* Loading Animation with live steps */}
              {isLoading && (
                <div className="flex items-start gap-4 w-full animate-slide-up">
                  <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary/30 shrink-0 mt-1">
                    <span className="material-symbols-outlined text-primary text-sm animate-pulse">cloud</span>
                  </div>
                  <div className="flex flex-col gap-stack-sm w-full">
                    <div className="glass-panel rounded-2xl rounded-tl-sm px-6 py-5 w-full">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary animate-spin" style={{ animationDuration: "2s" }}>progress_activity</span>
                        <span className="font-body-lg text-body-lg text-on-surface-variant">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom spacing spacer */}
          <div ref={chatEndRef} className="h-4 shrink-0" />
        </div>
      </div>

      {/* Bottom NavBar (Input Pill) */}
      <div className="fixed bottom-0 md:left-[300px] left-0 right-0 flex justify-center pb-stack-sm md:pb-stack-lg px-2 md:px-gutter z-50 pointer-events-none">
        <div className="w-full max-w-[800px] pointer-events-auto relative">
          <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full opacity-0 transition-opacity focus-within:opacity-100 -z-10"></div>
          <form onSubmit={sendMessage} className="bg-surface-container/40 backdrop-blur-2xl rounded-[30px] md:rounded-full border border-white/10 shadow-[0_0_50px_rgba(1,113,185,0.15)] flex flex-wrap md:flex-nowrap items-center p-2 focus-within:ring-2 focus-within:ring-secondary/50 transition-all font-body-md text-body-md">
            <button type="button" aria-label="Attach file" className="text-on-surface-variant p-2 hover:text-primary transition-all rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the weather anywhere..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder-on-surface-variant/50 px-4 py-3 outline-none"
              autoComplete="off"
              disabled={isLoading}
            />
            <button type="button" aria-label="Voice input" className="text-on-surface-variant p-2 hover:text-primary transition-all rounded-full flex items-center justify-center shrink-0 mr-1">
              <span className="material-symbols-outlined">mic</span>
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="bg-secondary-container text-on-secondary-container rounded-full p-3 shadow-[0_0_15px_rgba(156,202,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-50 disabled:active:scale-100"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Agent Step Trace — shows the full reasoning
   ────────────────────────────────────────────── */
function AgentStepTrace({ steps }: { steps: AgentStep[] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter out OUTPUT step since the content is shown in the main bubble
  const visibleSteps = steps.filter((s) => s.step !== "OUTPUT");

  if (visibleSteps.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
      {/* Header toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 md:px-5 py-3 hover:bg-white/5 transition-colors"
        aria-label={isExpanded ? "Collapse agent steps" : "Expand agent steps"}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary text-sm">neurology</span>
          <span className="font-label-md text-label-md text-on-surface-variant">
            Agent Reasoning · {visibleSteps.length} steps
          </span>
        </div>
        <span className={`material-symbols-outlined text-on-surface-variant text-sm transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {/* Steps list */}
      {isExpanded && (
        <div className="border-t border-white/5 px-4 md:px-5 py-3">
          <div className="flex flex-col gap-1">
            {visibleSteps.map((step, i) => {
              const config = STEP_CONFIG[step.step] || { icon: "info", label: step.step, color: "text-on-surface-variant" };
              return (
                <div key={`step-${i}`} className="flex items-start gap-3 py-2 group">
                  {/* Vertical line connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.step === "TOOL" || step.step === "TOOL_RESPONSE" ? "bg-amber-500/10" : "bg-white/5"}`}>
                      <span className={`material-symbols-outlined text-xs ${config.color}`} style={{ fontSize: "14px" }}>
                        {config.icon}
                      </span>
                    </div>
                    {i < visibleSteps.length - 1 && (
                      <div className="w-px h-full min-h-[8px] bg-white/10 mt-1"></div>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1 pb-1">
                    <span className={`font-label-sm text-label-sm ${config.color} uppercase tracking-wider`}>
                      {config.label}
                      {step.tool && (
                        <span className="text-on-surface-variant ml-1 normal-case tracking-normal">
                          → {step.tool}({step.input?.city ? `"${step.input.city}"` : ""})
                        </span>
                      )}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant/80 break-words leading-relaxed">
                      {step.step === "TOOL_RESPONSE" ? step.output : step.content}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Weather Card — renders current + forecast
   ────────────────────────────────────────────── */
function WeatherCard({ data }: { data: any }) {
  if (!data || !data.current || !data.forecast) return null;

  return (
    <>
      <div className="glass-panel rounded-2xl p-stack-lg w-full bg-linear-to-b from-surface-container-high/80 to-surface-container/40 overflow-hidden relative group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/20 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>partly_cloudy_day</span>
              <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
                {data.city ? `${data.city} · Current` : "Current"}
              </span>
            </div>
            <h3 className="font-display-xl text-5xl md:text-[64px] leading-none font-bold text-on-surface mt-2">{data.current.temp}°C</h3>
            <p className="font-headline-md text-headline-sm md:text-headline-md text-primary mt-1">{data.current.condition}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-stack-sm mt-stack-lg pt-stack-md border-t border-white/10">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Feels like</span>
            <span className="font-body-lg text-body-lg text-on-surface">{data.current.feelsLike}°C</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Humidity</span>
            <span className="font-body-lg text-body-lg text-on-surface">{data.current.humidity}%</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Wind</span>
            <span className="font-body-lg text-body-lg text-on-surface">{data.current.wind} km/h</span>
          </div>
        </div>
      </div>

      <div className="w-full mt-2">
        <h4 className="font-label-md text-label-md text-on-surface-variant mb-3 px-1">7-Day Forecast</h4>
        <div className="flex overflow-x-auto no-scrollbar gap-stack-sm pb-4 w-full">
          {data.forecast.map((dayData: any, i: number) => (
            <div
              key={`forecast-${i}`}
              className={`glass-panel rounded-xl p-4 flex flex-col items-center min-w-[90px] shrink-0 ${i === 0 ? "bg-primary-container/10 border-primary/20" : ""}`}
            >
              <span className={`font-label-md text-label-md ${i === 0 ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                {dayData.day}
              </span>
              <span className={`material-symbols-outlined ${i === 0 ? "text-secondary" : "text-on-surface"} my-2`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {dayData.icon}
              </span>
              <span className="font-body-md text-body-md text-on-surface">
                {dayData.high}° <span className="text-on-surface-variant text-sm">{dayData.low}°</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
