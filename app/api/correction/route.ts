import { NextResponse } from "next/server";
import { createAiClient, aiConfig } from "@/lib/ai";
import { parseJsonObject } from "@/lib/json";
import { buildCorrectionPrompt } from "@/lib/prompts";
import { getScenarioById } from "@/lib/scenarios";
import type { Correction, Scenario, ScoreBreakdown } from "@/lib/types";

export const runtime = "nodejs";

type CorrectionRequestBody = {
  text?: string;
  scenario?: string;
};

function clampScore(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 75;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeMeaningText(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function differsOnlyByWrittenFormatting(original: string, corrected: string) {
  const normalizedOriginal = normalizeMeaningText(original);
  const normalizedCorrected = normalizeMeaningText(corrected);

  return (
    normalizedOriginal.length > 0 &&
    normalizedOriginal === normalizedCorrected &&
    original.trim() !== corrected.trim()
  );
}

function createScenarioExpansion(text: string, scenario?: Scenario) {
  const normalizedText = text.trim().toLowerCase();

  if (normalizedText.includes("taxi")) {
    return "I prefer taking a taxi because it is faster and more convenient.";
  }

  if (scenario?.id === "job-interview") {
    return "I have relevant experience, and I can explain it with a specific example.";
  }

  if (scenario?.id === "restaurant-ordering") {
    return "I would like to order this, please.";
  }

  if (scenario?.id === "business-meeting") {
    return "I think this option works well because it is clear and practical.";
  }

  if (scenario?.id === "travel") {
    return "I prefer this option because it is more convenient for me.";
  }

  return "I would like to explain my answer with one clear example and one specific detail.";
}

function createFallbackCorrection(text: string, scenario?: Scenario): Correction {
  const trimmedText = text.trim();
  const isShortAnswer = countWords(trimmedText) <= 3;
  const spokenExpansion = createScenarioExpansion(trimmedText, scenario);

  return {
    original: trimmedText,
    corrected: isShortAnswer ? spokenExpansion : trimmedText,
    reason:
      "这句话可以理解。口语练习中不用重点纠结大小写或标点，建议把回答补充成更完整、自然的一句话。",
    betterExpression: spokenExpansion,
    scores: {
      grammar: 84,
      fluency: 80,
      vocabulary: 78,
      pronunciation: 80,
    },
  };
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

function parseCorrection(
  rawContent: string,
  originalText: string,
  scenario: Scenario,
) {
  const parsed = parseJsonObject<Correction>(rawContent);
  const fallback = createFallbackCorrection(originalText, scenario);
  const scores = isScoreBreakdown(parsed.scores)
    ? parsed.scores
    : fallback.scores;

  const original =
    typeof parsed.original === "string" && parsed.original.trim()
      ? parsed.original.trim()
      : originalText;
  const corrected =
    typeof parsed.corrected === "string" && parsed.corrected.trim()
      ? parsed.corrected.trim()
      : fallback.corrected;
  const reason =
    typeof parsed.reason === "string" && parsed.reason.trim()
      ? parsed.reason.trim()
      : fallback.reason;
  const betterExpression =
    typeof parsed.betterExpression === "string" &&
    parsed.betterExpression.trim()
      ? parsed.betterExpression.trim()
      : fallback.betterExpression;

  if (differsOnlyByWrittenFormatting(original, corrected)) {
    return {
      original,
      corrected: original,
      reason:
        "这句话可以理解。口语练习中不用重点纠结大小写或标点，重点可以放在表达是否完整自然。",
      betterExpression,
      scores: {
        grammar: Math.max(84, clampScore(scores.grammar)),
        fluency: Math.max(80, clampScore(scores.fluency)),
        vocabulary: Math.max(78, clampScore(scores.vocabulary)),
        pronunciation: Math.max(80, clampScore(scores.pronunciation)),
      },
    } satisfies Correction;
  }

  return {
    original,
    corrected,
    reason,
    betterExpression,
    scores: {
      grammar: clampScore(scores.grammar),
      fluency: clampScore(scores.fluency),
      vocabulary: clampScore(scores.vocabulary),
      pronunciation: clampScore(scores.pronunciation),
    },
  } satisfies Correction;
}

export async function POST(request: Request) {
  let body: CorrectionRequestBody;

  try {
    body = (await request.json()) as CorrectionRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const text = body.text?.trim();
  const scenario = getScenarioById(body.scenario);

  if (!text) {
    return NextResponse.json(
      { error: "Text is required for correction." },
      { status: 400 },
    );
  }

  if (!scenario) {
    return NextResponse.json(
      { error: "Invalid practice scenario." },
      { status: 400 },
    );
  }

  const ai = createAiClient();

  if (!ai) {
    return NextResponse.json({
      ...createFallbackCorrection(text, scenario),
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
            "You return strict JSON for English correction tasks. Do not use markdown.",
        },
        {
          role: "user",
          content: buildCorrectionPrompt(text, scenario),
        },
      ],
      max_tokens: 360,
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        ...createFallbackCorrection(text, scenario),
        provider: "fallback",
      });
    }

    return NextResponse.json({
      ...parseCorrection(content, text, scenario),
      provider: "deepseek",
    });
  } catch (error) {
    console.error("Correction API failed", error);

    return NextResponse.json({
      ...createFallbackCorrection(text, scenario),
      provider: "fallback",
    });
  }
}
