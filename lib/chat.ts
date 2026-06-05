import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { buildChatSystemPrompt, formatMessagesForPrompt } from "@/lib/prompts";
import type { ChatMessage, Scenario } from "@/lib/types";

export type ChatRequestBody = {
  scenario?: string;
  messages?: ChatMessage[];
};

export function fallbackChatReply(scenarioTitle: string) {
  const replies = {
    "Job Interview":
      "Good start. Could you share one specific project and explain your role in it?",
    "Restaurant Ordering":
      "Sure. Would you like anything to drink with your order?",
    "Business Meeting":
      "That makes sense. What risk do you think we should discuss first?",
    Travel: "Of course. Could you tell me where you want to go first?",
  };

  return (
    replies[scenarioTitle as keyof typeof replies] ??
    "Good answer. Can you add one more detail?"
  );
}

export function isValidChatMessages(messages: unknown): messages is ChatMessage[] {
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

export function buildAiChatMessages(
  scenario: Scenario,
  messages: ChatMessage[],
): ChatCompletionMessageParam[] {
  return [
    {
      role: "system",
      content: buildChatSystemPrompt(scenario),
    },
    ...formatMessagesForPrompt(messages),
  ];
}
