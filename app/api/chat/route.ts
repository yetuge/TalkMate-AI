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

  if (!ai) {
    return NextResponse.json({
      reply: fallbackChatReply(scenario.title),
      provider: "fallback",
    });
  }

  const messages = buildAiChatMessages(scenario, body.messages);

  try {
    const completion = await ai.chat.completions.create({
      model: aiConfig.model,
      messages,
      max_tokens: 180,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json({
        reply: fallbackChatReply(scenario.title),
        provider: "fallback",
      });
    }

    return NextResponse.json({
      reply,
      provider: "deepseek",
    });
  } catch (error) {
    console.error("Chat API failed", error);

    return NextResponse.json({
      reply: fallbackChatReply(scenario.title),
      provider: "fallback",
    });
  }
}
