import type { ChatMessage, Correction, Scenario } from "@/lib/types";

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

export function buildReportPrompt({
  scenario,
  messages,
  corrections,
  durationSeconds,
}: {
  scenario: Scenario;
  messages: ChatMessage[];
  corrections: Correction[];
  durationSeconds: number;
}) {
  return [
    "You are an English learning analyst.",
    "Generate a learning report for this speaking practice session.",
    "Return strict JSON only. Do not include markdown or explanations outside JSON.",
    `Scenario: ${scenario.title}`,
    `Duration seconds: ${durationSeconds}`,
    "Conversation messages:",
    JSON.stringify(
      messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      null,
      2,
    ),
    "Correction records:",
    JSON.stringify(corrections, null, 2),
    "JSON format:",
    "{",
    '  "overallScore": 0,',
    '  "scores": {',
    '    "grammar": 0,',
    '    "fluency": 0,',
    '    "vocabulary": 0,',
    '    "pronunciation": 0',
    "  },",
    '  "commonMistakes": [],',
    '  "suggestions": [],',
    '  "practiceSentences": [],',
    '  "speakingTasks": [],',
    '  "summary": ""',
    "}",
    "Rules:",
    "- Scores must be integers from 0 to 100.",
    "- commonMistakes must contain at least 3 items.",
    "- suggestions must contain at least 3 items.",
    "- practiceSentences must contain at least 5 English sentences.",
    "- speakingTasks must contain at least 5 English speaking tasks.",
    "- summary must be written in Chinese.",
  ].join("\n");
}
