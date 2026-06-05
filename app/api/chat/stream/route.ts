import { NextResponse } from "next/server";
import { createAiClient, aiConfig } from "@/lib/ai";
import {
  buildAiChatMessages,
  fallbackChatReply,
  isValidChatMessages,
  type ChatRequestBody,
} from "@/lib/chat";
import { getScenarioById } from "@/lib/scenarios";

export const runtime = "nodejs";

const encoder = new TextEncoder();

function encodeSseEvent(event: string, data: Record<string, unknown>) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function splitReplyIntoChunks(reply: string) {
  return reply.match(/\S+\s*/g) ?? [reply];
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function streamFallbackReply(
  controller: ReadableStreamDefaultController<Uint8Array>,
  scenarioTitle: string,
) {
  const fallbackReply = fallbackChatReply(scenarioTitle);

  for (const token of splitReplyIntoChunks(fallbackReply)) {
    controller.enqueue(encodeSseEvent("token", { token }));
    await wait(25);
  }

  controller.enqueue(encodeSseEvent("done", { provider: "fallback" }));
}

export async function POST(request: Request) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const scenario = getScenarioById(body.scenario);

  if (!scenario) {
    return NextResponse.json(
      { error: "Invalid practice scenario." },
      { status: 400 },
    );
  }

  if (!isValidChatMessages(body.messages)) {
    return NextResponse.json(
      { error: "Messages must be user or assistant chat messages." },
      { status: 400 },
    );
  }

  const ai = createAiClient();
  const messages = buildAiChatMessages(scenario, body.messages);
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      if (!ai) {
        await streamFallbackReply(controller, scenario.title);
        controller.close();
        return;
      }

      let hasEmittedToken = false;

      try {
        const completion = await ai.chat.completions.create({
          model: aiConfig.model,
          messages,
          max_tokens: 180,
          temperature: 0.7,
          stream: true,
        });

        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content;

          if (token) {
            hasEmittedToken = true;
            controller.enqueue(encodeSseEvent("token", { token }));
          }
        }

        controller.enqueue(encodeSseEvent("done", { provider: "deepseek" }));
      } catch (error) {
        console.error("Chat stream API failed", error);

        if (!hasEmittedToken) {
          await streamFallbackReply(controller, scenario.title);
        } else {
          controller.enqueue(
            encodeSseEvent("error", {
              message: "The AI stream ended early. Please send another reply.",
            }),
          );
          controller.enqueue(encodeSseEvent("done", { provider: "fallback" }));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
