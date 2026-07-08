import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MessageRole } from "@prisma/client";
import { client, MODEL } from "@/lib/mistral";
import { Weather_API } from "@/lib/weather";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";

const availableTools: Record<string, (city: string, date: string) => Promise<string>> = {
  Weather_API,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, content } = body;

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
    let chat = await prisma.chat.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: { userId: user.id, title: "Weather Inquiry" },
      });
    }

    // 3. Save User message to DB
    const userMessage = await prisma.message.create({
      data: { chatId: chat.id, content, role: MessageRole.USER },
    });

    // 4. Build the message history for the agent loop
    const history: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content },
    ];

    // 5. Agent Loop — mirrors the Python agent exactly
    const MAX_ITERATIONS = 15;
    let iterations = 0;
    let weatherDataResult: any = null;
    const agentSteps: Array<{ step: string; content: string; tool?: string; input?: any; output?: string }> = [];

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

      // Extract JSON from the response
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");

      if (start === -1 || end === -1) {
        // No JSON found — treat as plain text output
        const aiMessage = await prisma.message.create({
          data: { chatId: chat.id, content: raw, role: MessageRole.ASSISTANT },
        });
        return NextResponse.json({ success: true, userMessage, aiMessage });
      }

      let parsed: any;
      try {
        parsed = JSON.parse(raw.substring(start, end + 1));
      } catch {
        const aiMessage = await prisma.message.create({
          data: { chatId: chat.id, content: raw, role: MessageRole.ASSISTANT },
        });
        return NextResponse.json({ success: true, userMessage, aiMessage });
      }

      // 6. Handle each step type — same as the Python switch
      switch (parsed.step) {
        case "START":
        case "PLAN":
        case "OBSERVATION":
          // Collect the step for UI display
          agentSteps.push({ step: parsed.step, content: parsed.content || "" });
          // Continue to the next step
          history.push({
            role: "user",
            content: "Please continue to the next step.",
          });
          break;

        case "TOOL": {
          // Extract tool name and input
          const toolName: string = parsed.tool || "";
          const toolInput = parsed.input;
          agentSteps.push({ step: "TOOL", content: parsed.content || "", tool: toolName, input: toolInput });

          let output = "Tool not found.";

          if (toolName === "Weather_API" && typeof toolInput === "object") {
            const city = toolInput.city || "";
            const date = toolInput.date || "today";

            output = await availableTools.Weather_API(city, date);

            // Parse weather data for the UI card
            const tempMatch = output.match(/([+-]?\d+)°C/);
            const temp = tempMatch ? parseInt(tempMatch[1]) : 25;
            const conditionParts = output.split(" is ")[1] || "Clear";

            // Determine condition from the raw string
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
                feelsLike: temp + 2,
                humidity: 65,
                wind: 12,
              },
              forecast: [
                { day: "Today", icon: iconMap[condition] || "partly_cloudy_day", high: temp, low: temp - 5 },
                { day: "Tomorrow", icon: "partly_cloudy_day", high: temp + 1, low: temp - 4 },
                { day: "Day 3", icon: "cloud", high: temp - 1, low: temp - 6 },
                { day: "Day 4", icon: "sunny", high: temp + 2, low: temp - 3 },
                { day: "Day 5", icon: "sunny", high: temp + 3, low: temp - 2 },
                { day: "Day 6", icon: "partly_cloudy_day", high: temp, low: temp - 5 },
              ],
            };
          } else if (toolName in availableTools) {
            // Generic tool call fallback
            const city = typeof toolInput === "string" ? toolInput : toolInput?.city || "";
            const date = typeof toolInput === "string" ? "today" : toolInput?.date || "today";
            output = await availableTools[toolName](city, date);
          }

          // Collect the tool response step
          agentSteps.push({ step: "TOOL_RESPONSE", content: output, tool: toolName, input: toolInput, output });

          // Feed tool response back into history
          history.push({
            role: "user",
            content: JSON.stringify({
              step: "TOOL_RESPONSE",
              tool: toolName,
              input: toolInput,
              output,
            }),
          });
          break;
        }

        case "OUTPUT": {
          // Final answer — save to DB and return
          const finalContent: string = parsed.content || raw;
          agentSteps.push({ step: "OUTPUT", content: finalContent });

          const aiMessage = await prisma.message.create({
            data: {
              chatId: chat.id,
              content: finalContent,
              role: MessageRole.ASSISTANT,
              weatherData: weatherDataResult ? (weatherDataResult as any) : undefined,
            },
          });

          return NextResponse.json({
            success: true,
            userMessage,
            aiMessage,
            agentSteps,
          });
        }

        default:
          // Unknown step — push continuation
          history.push({
            role: "user",
            content: "Please continue to the next step.",
          });
          break;
      }
    }

    // Safety: if loop exhausts, return last known content
    const fallbackContent = "I apologize, but I wasn't able to complete the request. Please try again.";
    const aiMessage = await prisma.message.create({
      data: { chatId: chat.id, content: fallbackContent, role: MessageRole.ASSISTANT },
    });
    return NextResponse.json({ success: true, userMessage, aiMessage });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
