import { NextResponse } from "next/server";
import { createAiClient, aiConfig } from "@/lib/ai";
import { parseJsonObject } from "@/lib/json";
import { buildCorrectionPrompt } from "@/lib/prompts";
import { getScenarioById } from "@/lib/scenarios";
import type { Correction, ScoreBreakdown } from "@/lib/types";

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

function createFallbackCorrection(text: string): Correction {
  const trimmedText = text.trim();
  const corrected = trimmedText.endsWith(".") ? trimmedText : `${trimmedText}.`;

  return {
    original: trimmedText,
    corrected,
    reason:
      "这句话可以理解。备用纠错已补充基础标点，并尽量保持原意清晰。",
    betterExpression:
      "I would like to explain my answer with one clear example and one specific detail.",
    scores: {
      grammar: 78,
      fluency: 76,
      vocabulary: 74,
      pronunciation: 75,
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

function parseCorrection(rawContent: string, originalText: string) {
  const parsed = parseJsonObject<Correction>(rawContent);
  const scores = isScoreBreakdown(parsed.scores)
    ? parsed.scores
    : createFallbackCorrection(originalText).scores;

  return {
    original:
      typeof parsed.original === "string" && parsed.original.trim()
        ? parsed.original.trim()
        : originalText,
    corrected:
      typeof parsed.corrected === "string" && parsed.corrected.trim()
        ? parsed.corrected.trim()
        : createFallbackCorrection(originalText).corrected,
    reason:
      typeof parsed.reason === "string" && parsed.reason.trim()
        ? parsed.reason.trim()
        : createFallbackCorrection(originalText).reason,
    betterExpression:
      typeof parsed.betterExpression === "string" &&
      parsed.betterExpression.trim()
        ? parsed.betterExpression.trim()
        : createFallbackCorrection(originalText).betterExpression,
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
      ...createFallbackCorrection(text),
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
        ...createFallbackCorrection(text),
        provider: "fallback",
      });
    }

    return NextResponse.json({
      ...parseCorrection(content, text),
      provider: "deepseek",
    });
  } catch (error) {
    console.error("Correction API failed", error);

    return NextResponse.json({
      ...createFallbackCorrection(text),
      provider: "fallback",
    });
  }
}
