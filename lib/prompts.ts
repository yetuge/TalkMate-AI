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

export function buildCorrectionPrompt(text: string, scenario: Scenario) {
  return [
    "You are a professional English teacher.",
    "Analyze the learner's English sentence for spoken English practice.",
    `Current scenario: ${scenario.title}`,
    `Learner sentence: ${text}`,
    "Return strict JSON only. Do not include markdown or explanations outside JSON.",
    "JSON format:",
    "{",
    '  "original": "",',
    '  "corrected": "",',
    '  "reason": "",',
    '  "betterExpression": "",',
    '  "scores": {',
    '    "grammar": 0,',
    '    "fluency": 0,',
    '    "vocabulary": 0,',
    '    "pronunciation": 0',
    "  }",
    "}",
    "Rules:",
    "- original must be the learner sentence.",
    "- corrected should fix grammar and wording while preserving meaning.",
    "- reason should be short, clear, and in English.",
    "- betterExpression should sound natural in the current scenario.",
    "- If the sentence is already good, say it is good and still provide a more natural expression.",
    "- Scores must be integers from 0 to 100.",
    "- Pronunciation is estimated from text fluency because no real audio is available.",
  ].join("\n");
}
