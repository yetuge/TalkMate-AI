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

export function buildCorrectionPrompt({
  text,
  scenario,
  previousAssistantMessage,
}: {
  text: string;
  scenario: Scenario;
  previousAssistantMessage?: string;
}) {
  return [
    "You are a professional English teacher.",
    "Analyze the learner's English sentence for spoken English practice.",
    `Current scenario: ${scenario.title}`,
    previousAssistantMessage
      ? `Assistant previous question: ${previousAssistantMessage}`
      : "Assistant previous question: not provided.",
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
    "- Treat this as spoken English feedback, not written essay proofreading.",
    "- Evaluate whether the learner's answer responds naturally to the assistant's previous question.",
    "- If the previous question is a yes/no question, a short answer like 'yes, please' can be acceptable.",
    "- If the previous question offers choices, check whether the learner clearly selected one option.",
    "- If the learner's answer is understandable from context, do not treat it as wrong only because it is short.",
    "- Ignore capitalization, punctuation, comma spacing, and other written formatting issues unless they change meaning.",
    "- Do not mention capitalization, punctuation, comma spacing, or missing periods as the main reason.",
    "- corrected should fix grammar, word choice, word order, or completeness only when they affect spoken communication.",
    "- For short but understandable answers, do not mark them as wrong; expand them into a complete natural spoken sentence.",
    "- reason should be short, clear, written in Chinese, and focus on communication or spoken fluency.",
    "- betterExpression should sound natural in the current scenario and be useful as the learner's next spoken answer.",
    "- If the sentence is already understandable, say it is understandable and provide a more complete or natural expression.",
    "- Scores must be integers from 0 to 100.",
    "- Do not lower scores only because of written formatting.",
    "- Pronunciation is estimated from text fluency because no real audio is available; do not claim to hear real pronunciation.",
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
    "- commonMistakes must contain at least 3 Chinese items.",
    "- suggestions must contain at least 3 Chinese items.",
    "- practiceSentences must contain at least 5 English sentences.",
    "- speakingTasks must contain at least 5 Chinese speaking tasks.",
    "- summary must be written in Chinese.",
  ].join("\n");
}
