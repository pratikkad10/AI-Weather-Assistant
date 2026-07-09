import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { client, MODEL } from "@/lib/mistral";
import { Weather_API } from "@/lib/weather";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";

const availableTools: Record<string, (city: string, date: string) => Promise<string>> = {
  Weather_API,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const chatId = searchParams.get("chatId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  try {
    const email = `anon_${sessionId}@local.app`;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ messages: [], chatId: null });

    let chat;
    if (chatId && chatId !== "new") {
      chat = await prisma.chat.findUnique({
        where: { id: chatId, userId: user.id },
      });
    } else if (!chatId) {
      chat = await prisma.chat.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!chat) return NextResponse.json({ messages: [], chatId: null });

    const messages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages, chatId: chat.id });
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, content, chatId: reqChatId } = body;

    if (!sessionId || !content) {
      return NextResponse.json({ error: "Missing sessionId or content" }, { status: 400 });
    }

    // 1. Find or create the anonymous user
    const email = `anon_${sessionId}@local.app`;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name: "Anonymous User" },
      });
    }

    // 2. Find or create a Chat for this user
    let chat;
    if (reqChatId && reqChatId !== "new") {
      chat = await prisma.chat.findUnique({
        where: { id: reqChatId, userId: user.id },
      });
    }

    if (!chat) {
      chat = await prisma.chat.create({
        data: { userId: user.id, title: content.substring(0, 30) || "Weather Inquiry" },
      });
    }

    // 3. Save User message to DB
    const userMessage = await prisma.message.create({
      data: { chatId: chat.id, content, role: "USER" },
    });

    // 4. Fetch full chat history to maintain LLM context
    const dbMessages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(data: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }

        // Send initial user message confirmation
        sendEvent({ type: "user_message", userMessage });

        const history: Array<{ role: string; content: string }> = [
          { role: "system", content: SYSTEM_PROMPT },
          ...dbMessages.map((msg) => ({
            role: msg.role === "USER" ? "user" : "assistant",
            content: msg.content,
          })),
        ];

        const MAX_ITERATIONS = 15;
        let iterations = 0;
        let weatherDataResult: any = null;
        const agentSteps: Array<{ step: string; content: string; tool?: string; input?: any; output?: string }> = [];

        try {
          while (iterations < MAX_ITERATIONS) {
            iterations++;

            const response = await client.chat.complete({
              model: MODEL,
              messages: history as any,
            });

            const rawContent = response.choices?.[0]?.message?.content;
            const raw: string = typeof rawContent === "string"
              ? rawContent
              : rawContent ? JSON.stringify(rawContent) : "";

            history.push({ role: "assistant", content: raw });

            const parsedObjects: any[] = [];
            let depth = 0;
            let startIdx = -1;
            for (let i = 0; i < raw.length; i++) {
              if (raw[i] === "{") {
                if (depth === 0) startIdx = i;
                depth++;
              } else if (raw[i] === "}") {
                depth--;
                if (depth === 0 && startIdx !== -1) {
                  try {
                    parsedObjects.push(JSON.parse(raw.substring(startIdx, i + 1)));
                  } catch (e) {}
                }
              }
            }

            if (parsedObjects.length === 0) {
              const aiMessage = await prisma.message.create({
                data: { chatId: chat.id, content: raw, role: "ASSISTANT" },
              });
              sendEvent({ type: "output", aiMessage, agentSteps });
              controller.close();
              return;
            }

            let shouldContinue = true;

            for (const parsed of parsedObjects) {
              if (!parsed.step) continue;

              switch (parsed.step) {
                case "START":
                case "PLAN":
                case "OBSERVATION": {
                  const stepObj = { step: parsed.step, content: parsed.content || "" };
                  agentSteps.push(stepObj);
                  sendEvent({ type: "step", step: stepObj });
                  break;
                }

                case "TOOL": {
                  const toolName: string = parsed.tool || "";
                  const toolInput = parsed.input;
                  const stepObj = { step: "TOOL", content: parsed.content || "", tool: toolName, input: toolInput };
                  agentSteps.push(stepObj);
                  sendEvent({ type: "step", step: stepObj });

                  let output = "Tool not found.";

                  if (toolName === "Weather_API" && typeof toolInput === "object") {
                    const city = toolInput.city || "";
                    const date = toolInput.date || "today";

                    output = await availableTools.Weather_API(city, date);

                    const tempMatch = output.match(/([+-]?\d+)°C/);
                    const temp = tempMatch ? parseInt(tempMatch[1]) : 25;
                    const conditionParts = output.split(" is ")[1] || "Clear";

                    const condLower = conditionParts.toLowerCase();
                    let condition = "Clear";
                    if (condLower.includes("cloud")) condition = "Partly Cloudy";
                    else if (condLower.includes("rain")) condition = "Rainy";
                    else if (condLower.includes("sun") || condLower.includes("clear")) condition = "Sunny";
                    else if (condLower.includes("fog") || condLower.includes("mist")) condition = "Foggy";
                    else if (condLower.includes("snow")) condition = "Snowy";
                    else condition = conditionParts.split("+")[0]?.trim() || "Clear";

                    const iconMap: Record<string, string> = {
                      "Partly Cloudy": "partly_cloudy_day",
                      "Cloudy": "cloud",
                      "Rainy": "rainy",
                      "Sunny": "sunny",
                      "Clear": "sunny",
                      "Foggy": "foggy",
                      "Snowy": "cloudy_snowing",
                    };

                    weatherDataResult = {
                      city,
                      current: {
                        temp,
                        condition,
                      }
                    };
                  } else if (toolName in availableTools) {
                    const city = typeof toolInput === "string" ? toolInput : toolInput?.city || "";
                    const date = typeof toolInput === "string" ? "today" : toolInput?.date || "today";
                    output = await availableTools[toolName](city, date);
                  }

                  const responseStep = { step: "TOOL_RESPONSE", content: output, tool: toolName, input: toolInput, output };
                  agentSteps.push(responseStep);
                  sendEvent({ type: "step", step: responseStep });

                  history.push({
                    role: "user",
                    content: JSON.stringify({
                      step: "TOOL_RESPONSE",
                      tool: toolName,
                      input: toolInput,
                      output,
                    }),
                  });
                  
                  shouldContinue = false;
                  break;
                }

                case "OUTPUT": {
                  const finalContent: string = parsed.content || raw;
                  const stepObj = { step: "OUTPUT", content: finalContent };
                  agentSteps.push(stepObj);
                  sendEvent({ type: "step", step: stepObj });

                  const aiMessage = await prisma.message.create({
                    data: {
                      chatId: chat.id,
                      content: finalContent,
                      role: "ASSISTANT",
                      weatherData: weatherDataResult ? (weatherDataResult as any) : undefined,
                    },
                  });

                  sendEvent({ type: "output", aiMessage, agentSteps, chatId: chat.id });
                  controller.close();
                  return;
                }
              }

              if (!shouldContinue) {
                break;
              }
            }

            if (shouldContinue) {
              history.push({
                role: "user",
                content: "Please continue to the next step.",
              });
            }
          }

          // Safety if loop exhausts
          const fallbackContent = "I apologize, but I wasn't able to complete the request. Please try again.";
          const aiMessage = await prisma.message.create({
            data: { chatId: chat.id, content: fallbackContent, role: "ASSISTANT" },
          });
          sendEvent({ type: "output", aiMessage, agentSteps, chatId: chat.id });
          controller.close();

        } catch (error) {
          console.error("Stream Error:", error);
          sendEvent({ type: "error", error: "Internal Server Error" });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
