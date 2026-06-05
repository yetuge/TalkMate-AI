import { NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { createAiClient, aiConfig } from "@/lib/ai";
import { buildChatSystemPrompt, formatMessagesForPrompt } from "@/lib/prompts";
import { getScenarioById } from "@/lib/scenarios";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

type ChatRequestBody = {
  scenario?: string;
  messages?: ChatMessage[];
};

function fallbackReply(scenarioTitle: string) {
  const replies = {
    "Job Interview":
      "Good start. Could you share one specific project and explain your role in it?",
    "Restaurant Ordering":
      "Sure. Would you like anything to drink with your order?",
    "Business Meeting":
      "That makes sense. What risk do you think we should discuss first?",
    Travel:
      "Of course. Could you tell me where you want to go first?",
  };

  return (
    replies[scenarioTitle as keyof typeof replies] ??
    "Good answer. Can you add one more detail?"
  );
}

function isValidMessages(messages: unknown): messages is ChatMessage[] {
  return (
    Array.isArray(messages) &&
    messages.every(
      (message) =>
        typeof message === "object" &&
        message !== null &&
        "role" in message &&
        "content" in message &&
        typeof message.content === "string" &&
        (message.role === "user" || message.role === "assistant"),
    )
  );
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

  if (!isValidMessages(body.messages)) {
    return NextResponse.json(
      { error: "Messages must be user or assistant chat messages." },
      { status: 400 },
    );
  }

  const ai = createAiClient();

  if (!ai) {
    return NextResponse.json({
      reply: fallbackReply(scenario.title),
      provider: "fallback",
    });
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: buildChatSystemPrompt(scenario),
    },
    ...formatMessagesForPrompt(body.messages),
  ];

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
        reply: fallbackReply(scenario.title),
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
      reply: fallbackReply(scenario.title),
      provider: "fallback",
    });
  }
}
