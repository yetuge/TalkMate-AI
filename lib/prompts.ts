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
    "You are an English speaking coach.",
    "Evaluate the user's reply in the conversation context.",
    `Current scenario: ${scenario.title}`,
    previousAssistantMessage
      ? `assistantMessage: ${previousAssistantMessage}`
      : "assistantMessage: not provided.",
    `userMessage: ${text}`,
    "Input includes:",
    "- assistantMessage: the previous AI message",
    "- userMessage: the user's latest reply",
    "Return strict JSON only. Do not include markdown or explanations outside JSON.",
    "JSON format:",
    "{",
    '  "feedbackType": "CORRECTION",',
    '  "originalText": "",',
    '  "recommendedExpression": "",',
    '  "reason": "",',
    '  "scores": {',
    '    "grammar": 0,',
    '    "fluency": 0,',
    '    "vocabulary": 0,',
    '    "pronunciation": 0',
    "  }",
    "}",
    "Rules:",
    '- feedbackType must be one of "CORRECTION", "ENHANCEMENT", or "CONTEXT_VALID".',
    "- originalText must be the user's latest reply.",
    "- recommendedExpression must preserve the user's original meaning.",
    "- Never add new reasons, emotions, preferences, opinions, facts, or intentions unless the user explicitly said them.",
    "- If the user's reply is a valid short answer in context, do not force it into a complete standalone sentence.",
    "- Ignore capitalization, punctuation, and spacing unless they affect meaning.",
    "- reason must be written in Chinese.",
    "- Mention only the single most important issue in the reason.",
    "- If the sentence is already natural in context, recommendedExpression can be the same as userMessage or a minimal polished version.",
    '- If there is a clear grammar or word choice error, use feedbackType "CORRECTION" and give a corrected natural sentence.',
    '- If the reply is correct but can sound a little more natural, use feedbackType "ENHANCEMENT" and keep the meaning unchanged.',
    '- If the reply is a valid short answer in context, use feedbackType "CONTEXT_VALID" and only polish minimally.',
    "- Scores must be integers from 0 to 100.",
    "- Do not lower scores significantly because of capitalization, punctuation, or spacing.",
    "- Context-valid short replies should usually have grammar and fluency scores of at least 85.",
    "- Light word choice issues such as 'any recommendation' should usually have grammar scores of at least 80.",
    "- Pronunciation is estimated from text fluency because no real audio is available; do not claim to hear real pronunciation.",
    "Few-shot examples:",
    "Example 1:",
    'assistantMessage: "What kind of food are you in the mood for-something traditional or a specific cuisine?"',
    'userMessage: "specific cuisine"',
    "Good output:",
    '{"feedbackType":"CONTEXT_VALID","originalText":"specific cuisine","recommendedExpression":"A specific cuisine.","reason":"这句话在当前上下文中可以自然成立。加上冠词 A 会让表达稍微更完整。","scores":{"grammar":88,"fluency":88,"vocabulary":85,"pronunciation":86}}',
    "Bad output:",
    '"I prefer this option because it is more convenient for me."',
    "Example 2:",
    'assistantMessage: "How can I help you with your trip?"',
    'userMessage: "do you have any recommendation"',
    "Good output:",
    '{"feedbackType":"CORRECTION","originalText":"do you have any recommendation","recommendedExpression":"Do you have any recommendations?","reason":"这里是在泛泛询问推荐，用复数 recommendations 更自然。","scores":{"grammar":82,"fluency":84,"vocabulary":82,"pronunciation":84}}',
    "Example 3:",
    'assistantMessage: "Would you like coffee or tea?"',
    'userMessage: "coffee"',
    "Good output:",
    '{"feedbackType":"CONTEXT_VALID","originalText":"coffee","recommendedExpression":"Coffee, please.","reason":"这是当前上下文中成立的简短回答。加上 please 会更礼貌一点。","scores":{"grammar":90,"fluency":90,"vocabulary":86,"pronunciation":88}}',
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
