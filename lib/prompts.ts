import type { ChatMessage, Scenario } from "@/lib/types";

export function buildChatSystemPrompt(scenario: Scenario) {
  return [
    "You are a professional English speaking coach.",
    `Current scenario: ${scenario.title}`,
    `Your role: ${scenario.aiRole}`,
    `Opening question: ${scenario.openingQuestion}`,
    "Your tasks:",
    "- Reply only in English.",
    "- Keep each reply short and natural, between 1 and 3 sentences.",
    "- Ask one clear follow-up question when useful.",
    "- Encourage the learner to speak more.",
    "- Match the difficulty to the scenario and the learner's current level.",
    "- Do not explain in Chinese.",
    "- Do not ask too many questions at once.",
    "Scenario goals:",
    ...scenario.goals.map((goal) => `- ${goal}`),
  ].join("\n");
}

export function formatMessagesForPrompt(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}
