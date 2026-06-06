import { NextResponse } from "next/server";
import { createAiClient, aiConfig } from "@/lib/ai";
import {
  getCorrectionFeedbackType,
  getCorrectionRecommendation,
} from "@/lib/corrections";
import { parseJsonObject } from "@/lib/json";
import { buildReportPrompt } from "@/lib/prompts";
import { getScenarioById } from "@/lib/scenarios";
import type {
  ChatMessage,
  Correction,
  PracticeReport,
  Scenario,
  ScoreBreakdown,
} from "@/lib/types";

export const runtime = "nodejs";

type ReportRequestBody = {
  scenario?: string;
  messages?: ChatMessage[];
  corrections?: Correction[];
  durationSeconds?: number;
};

function clampScore(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 75;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function isScoreBreakdown(value: unknown): value is ScoreBreakdown {
  return (
    typeof value === "object" &&
    value !== null &&
    "grammar" in value &&
    "fluency" in value &&
    "vocabulary" in value &&
    "pronunciation" in value
  );
}

function isChatMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
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

function isCorrections(value: unknown): value is Correction[] {
  return (
    Array.isArray(value) &&
    value.every(
      (correction) =>
        typeof correction === "object" &&
        correction !== null &&
        "reason" in correction &&
        "scores" in correction &&
        (("originalText" in correction &&
          "recommendedExpression" in correction) ||
          ("original" in correction &&
            "corrected" in correction &&
            "betterExpression" in correction)),
    )
  );
}

function averageScore(corrections: Correction[], key: keyof ScoreBreakdown) {
  if (corrections.length === 0) {
    return 76;
  }

  const total = corrections.reduce(
    (sum, correction) => sum + correction.scores[key],
    0,
  );

  return Math.round(total / corrections.length);
}

function isFormattingIssue(text: string) {
  return /大写|小写|首字母|标点|逗号|空格|句号|问号|capital|punctuation|comma|spacing|period|question mark/iu.test(
    text,
  );
}

function getUserReplyCount(messages: ChatMessage[]) {
  return messages.filter((message) => message.role === "user").length;
}

function createCommonMistakes(corrections: Correction[]) {
  return corrections
    .filter(
      (correction) =>
        getCorrectionFeedbackType(correction.feedbackType) === "CORRECTION" &&
        !isFormattingIssue(correction.reason),
    )
    .map((correction) => correction.reason)
    .filter((reason, index, reasons) => reasons.indexOf(reason) === index)
    .slice(0, 3);
}

function createScenarioSuggestions(scenario: Scenario, hasMistakes: boolean) {
  if (scenario.id === "travel") {
    return hasMistakes
      ? [
          "询问推荐时，可以优先练习 Do you have any recommendations? 这类自然问法。",
          "把问题说得更具体，例如说明想问景点、餐厅还是交通。",
          "多练习旅行场景中的实用词汇，如 attractions、directions、schedule。",
        ]
      : [
          "继续练习把简短回答说得清楚自然。",
          "尝试围绕景点、交通、住宿各提出一个英文问题。",
          "多使用 please、could you 等礼貌表达，让旅行咨询更自然。",
        ];
  }

  return hasMistakes
    ? [
        "优先复习本次纠错中出现的真实问题。",
        "把推荐表达多读几遍，熟悉更自然的口语句型。",
        "下一轮回答时尽量补充一个具体信息，让对话更完整。",
      ]
    : [
        "继续保持简短清晰的回答。",
        "下一轮可以主动补充一个具体细节。",
        "多练习把同一个意思换成两种自然表达。",
      ];
}

function createPracticeSentences(
  corrections: Correction[],
  scenario: Scenario,
) {
  const recommendations = corrections
    .map((correction) => getCorrectionRecommendation(correction))
    .filter(Boolean)
    .slice(0, 3);

  if (recommendations.length >= 3) {
    return recommendations;
  }

  const fallback =
    scenario.id === "travel"
      ? [
          "Do you have any recommendations?",
          "Could you recommend a place to visit?",
          "Could you help me with the bus schedule?",
          "What local food do you recommend?",
          "How can I get there from my hotel?",
        ]
      : [
          "Could you give me a recommendation?",
          "I would like to explain my answer clearly.",
          "Could you help me with that?",
          "Let me give you one more detail.",
          "That sounds good to me.",
        ];

  return [...recommendations, ...fallback]
    .filter((sentence, index, sentences) => sentences.indexOf(sentence) === index)
    .slice(0, 5);
}

function createSpeakingTasks(scenario: Scenario) {
  if (scenario.id === "travel") {
    return [
      "用英文询问一个景点推荐。",
      "用英文询问公交或路线信息。",
      "用英文说明你想找餐厅、景点还是交通建议。",
      "用英文向酒店前台请求帮助。",
      "用英文描述你计划去哪里以及为什么。",
    ];
  }

  return [
    "用英文回答一个简短问题，并补充一个细节。",
    "用英文提出一个礼貌请求。",
    "用英文复述一条推荐表达。",
    "用英文说明你的选择。",
    "用英文提出一个追问。",
  ];
}

function createFallbackReport({
  corrections,
  messages,
  scenario,
}: {
  corrections: Correction[];
  messages: ChatMessage[];
  scenario: Scenario;
}): PracticeReport {
  const scores = {
    grammar: averageScore(corrections, "grammar"),
    fluency: averageScore(corrections, "fluency"),
    vocabulary: averageScore(corrections, "vocabulary"),
    pronunciation: averageScore(corrections, "pronunciation"),
  };
  const overallScore = Math.round(
    (scores.grammar + scores.fluency + scores.vocabulary + scores.pronunciation) /
      4,
  );
  const commonMistakes = createCommonMistakes(corrections);
  const userReplyCount = getUserReplyCount(messages);
  const sampleNote =
    userReplyCount < 3
      ? "本次练习样本较少，以下建议仅基于当前几轮对话。"
      : "本次练习已经能够完成基础交流。";

  return {
    overallScore,
    scores,
    commonMistakes,
    suggestions: createScenarioSuggestions(scenario, commonMistakes.length > 0),
    practiceSentences: createPracticeSentences(corrections, scenario),
    speakingTasks: createSpeakingTasks(scenario),
    summary: `${sampleNote} 接下来可以继续练习更具体、自然的场景表达。`,
  };
}

function normalizeStringArray(value: unknown, fallback: string[], minLength: number) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .filter((item) => item.trim())
    .map((item) => item.trim());

  if (items.length < minLength) {
    return fallback;
  }

  return items;
}

function normalizeCommonMistakes(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .filter((item) => item.trim() && !isFormattingIssue(item))
    .slice(0, 3);
}

function parseReport(rawContent: string, fallback: PracticeReport) {
  const parsed = parseJsonObject<PracticeReport>(rawContent);
  const scores = isScoreBreakdown(parsed.scores) ? parsed.scores : fallback.scores;

  return {
    overallScore: clampScore(parsed.overallScore ?? fallback.overallScore),
    scores: {
      grammar: clampScore(scores.grammar),
      fluency: clampScore(scores.fluency),
      vocabulary: clampScore(scores.vocabulary),
      pronunciation: clampScore(scores.pronunciation),
    },
    commonMistakes: normalizeCommonMistakes(
      parsed.commonMistakes,
      fallback.commonMistakes,
    ),
    suggestions: normalizeStringArray(parsed.suggestions, fallback.suggestions, 2),
    practiceSentences: normalizeStringArray(
      parsed.practiceSentences,
      fallback.practiceSentences,
      5,
    ),
    speakingTasks: normalizeStringArray(
      parsed.speakingTasks,
      fallback.speakingTasks,
      5,
    ),
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : fallback.summary,
  } satisfies PracticeReport;
}

export async function POST(request: Request) {
  let body: ReportRequestBody;

  try {
    body = (await request.json()) as ReportRequestBody;
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

  if (!isChatMessages(body.messages)) {
    return NextResponse.json(
      { error: "Messages must be user or assistant chat messages." },
      { status: 400 },
    );
  }

  if (!isCorrections(body.corrections)) {
    return NextResponse.json(
      { error: "Corrections must be valid correction records." },
      { status: 400 },
    );
  }

  const durationSeconds =
    typeof body.durationSeconds === "number" && body.durationSeconds > 0
      ? Math.round(body.durationSeconds)
      : 60;
  const fallback = createFallbackReport({
    corrections: body.corrections,
    messages: body.messages,
    scenario,
  });
  const ai = createAiClient();

  if (!ai) {
    return NextResponse.json({
      ...fallback,
      provider: "fallback",
    });
  }

  try {
    const completion = await ai.chat.completions.create({
      model: aiConfig.model,
      messages: [
        {
          role: "system",
          content:
            "You return strict JSON for English speaking learning reports. Do not use markdown.",
        },
        {
          role: "user",
          content: buildReportPrompt({
            scenario,
            messages: body.messages,
            corrections: body.corrections,
            durationSeconds,
          }),
        },
      ],
      max_tokens: 900,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        ...fallback,
        provider: "fallback",
      });
    }

    return NextResponse.json({
      ...parseReport(content, fallback),
      provider: "deepseek",
    });
  } catch (error) {
    console.error("Report API failed", error);

    return NextResponse.json({
      ...fallback,
      provider: "fallback",
    });
  }
}
