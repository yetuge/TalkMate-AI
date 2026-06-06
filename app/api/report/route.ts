import { NextResponse } from "next/server";
import { createAiClient, aiConfig } from "@/lib/ai";
import { parseJsonObject } from "@/lib/json";
import { buildReportPrompt } from "@/lib/prompts";
import { getScenarioById } from "@/lib/scenarios";
import type {
  ChatMessage,
  Correction,
  PracticeReport,
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

function createFallbackReport(corrections: Correction[]): PracticeReport {
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

  return {
    overallScore,
    scores,
    commonMistakes: [
      "部分回答还可以加入更具体的细节。",
      "句子结构可以更加自然。",
      "词汇选择可以更加丰富。",
    ],
    suggestions: [
      "每次回答后补充一个具体例子。",
      "描述已完成的工作时，注意清楚使用过去时。",
      "多练习使用 first、also、finally 等连接词。",
    ],
    practiceSentences: [
      "I worked on a booking system for a real project.",
      "I improved the user experience by making pages load faster.",
      "One challenge I solved was communicating requirements clearly.",
      "I would like to explain my idea with a specific example.",
      "In my opinion, this plan is practical but needs more detail.",
    ],
    speakingTasks: [
      "用一分钟完成英文自我介绍。",
      "描述一个你做过的项目。",
      "解释一个你解决过的挑战。",
      "针对一个项目计划表达你的观点。",
      "用英文提出两个追问。",
    ],
    summary:
      "本次练习已经能够完成基础交流。接下来可以重点提升句子细节、时态准确性和表达的自然度。",
  };
}

function normalizeStringArray(value: unknown, fallback: string[], minLength: number) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.filter((item): item is string => typeof item === "string");

  if (items.length < minLength) {
    return fallback;
  }

  return items;
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
    commonMistakes: normalizeStringArray(
      parsed.commonMistakes,
      fallback.commonMistakes,
      3,
    ),
    suggestions: normalizeStringArray(parsed.suggestions, fallback.suggestions, 3),
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
  const fallback = createFallbackReport(body.corrections);
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
