import { NextResponse } from "next/server";
import { createAiClient, aiConfig } from "@/lib/ai";
import { getCorrectionFeedbackType } from "@/lib/corrections";
import { parseJsonObject } from "@/lib/json";
import { buildCorrectionPrompt } from "@/lib/prompts";
import { getScenarioById } from "@/lib/scenarios";
import type {
  Correction,
  CorrectionFeedbackType,
  ScoreBreakdown,
} from "@/lib/types";

export const runtime = "nodejs";

type CorrectionRequestBody = {
  text?: string;
  scenario?: string;
  previousAssistantMessage?: string;
};

type ParsedCorrectionPayload = Partial<Correction> & {
  original?: string;
  corrected?: string;
  betterExpression?: string;
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

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeText(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function normalizeWords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function mentionsWrittenFormatting(reason: string) {
  return /capital|uppercase|lowercase|punctuation|comma|spacing|period|question mark|大写|小写|首字母|标点|逗号|空格|句号|问号/iu.test(
    reason,
  );
}

function hasChineseText(text: string) {
  return /\p{Script=Han}/u.test(text);
}

function isRecommendationRequest(text: string) {
  return /\brecommendation(s)?\b|\brecommend\b|\bsuggestion(s)?\b/iu.test(
    text,
  );
}

function keepsRecommendationMeaning(text: string) {
  return /\brecommendation(s)?\b|\brecommend\b|\bsuggestion(s)?\b/iu.test(
    text,
  );
}

function isAffirmativeAnswer(text: string) {
  return /^(yes|yeah|yep|sure|ok|okay|please|yesplease|yespleas)$/u.test(
    normalizeText(text),
  );
}

function isNegativeAnswer(text: string) {
  return /^(no|nope|notnow|nothanks|nothankyou)$/u.test(normalizeText(text));
}

function isChoiceQuestion(text?: string) {
  return Boolean(text && /\bor\b/i.test(text));
}

function isContextValidShortReply(
  userMessage: string,
  assistantMessage?: string,
) {
  const trimmedUserMessage = userMessage.trim();

  if (!assistantMessage || countWords(trimmedUserMessage) > 3) {
    return false;
  }

  if (isAffirmativeAnswer(trimmedUserMessage) || isNegativeAnswer(trimmedUserMessage)) {
    return true;
  }

  const assistantWords = new Set(normalizeWords(assistantMessage));
  const userWords = normalizeWords(trimmedUserMessage);

  return userWords.length > 0 && userWords.every((word) => assistantWords.has(word));
}

function capitalizeFirst(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return trimmedText;
  }

  return `${trimmedText[0].toUpperCase()}${trimmedText.slice(1)}`;
}

function createMinimalContextPolish(
  userMessage: string,
  assistantMessage?: string,
) {
  const normalizedUserMessage = normalizeText(userMessage);

  if (normalizedUserMessage === "specificcuisine") {
    return "A specific cuisine.";
  }

  if (normalizedUserMessage === "coffee") {
    return "Coffee, please.";
  }

  if (normalizedUserMessage === "tea") {
    return "Tea, please.";
  }

  if (isAffirmativeAnswer(userMessage)) {
    return "Yes, please.";
  }

  if (isNegativeAnswer(userMessage)) {
    return "No, thank you.";
  }

  if (isChoiceQuestion(assistantMessage) && countWords(userMessage) <= 2) {
    return `${capitalizeFirst(userMessage)}, please.`;
  }

  return `${capitalizeFirst(userMessage)}.`;
}

function createContextValidReason(userMessage: string) {
  const normalizedUserMessage = normalizeText(userMessage);

  if (normalizedUserMessage === "specificcuisine") {
    return "这句话在当前上下文中可以自然成立。加上冠词 A 会让表达稍微更完整。";
  }

  if (normalizedUserMessage === "coffee") {
    return "这是当前上下文中成立的简短回答。加上 please 会更礼貌一点。";
  }

  return "这是当前上下文中成立的简短回答。推荐表达只做了轻微润色。";
}

function createFallbackScores(type: CorrectionFeedbackType, originalText: string) {
  if (type === "CONTEXT_VALID") {
    return {
      grammar: 88,
      fluency: 88,
      vocabulary: 85,
      pronunciation: 86,
    };
  }

  if (isRecommendationRequest(originalText)) {
    return {
      grammar: 82,
      fluency: 84,
      vocabulary: 82,
      pronunciation: 84,
    };
  }

  return {
    grammar: 84,
    fluency: 82,
    vocabulary: 80,
    pronunciation: 82,
  };
}

function floorScoresForType(
  scores: ScoreBreakdown,
  type: CorrectionFeedbackType,
  originalText: string,
) {
  if (type === "CONTEXT_VALID") {
    return {
      grammar: Math.max(85, clampScore(scores.grammar)),
      fluency: Math.max(85, clampScore(scores.fluency)),
      vocabulary: Math.max(82, clampScore(scores.vocabulary)),
      pronunciation: Math.max(84, clampScore(scores.pronunciation)),
    };
  }

  if (isRecommendationRequest(originalText)) {
    return {
      grammar: Math.max(80, clampScore(scores.grammar)),
      fluency: Math.max(80, clampScore(scores.fluency)),
      vocabulary: Math.max(80, clampScore(scores.vocabulary)),
      pronunciation: Math.max(82, clampScore(scores.pronunciation)),
    };
  }

  return {
    grammar: clampScore(scores.grammar),
    fluency: clampScore(scores.fluency),
    vocabulary: clampScore(scores.vocabulary),
    pronunciation: clampScore(scores.pronunciation),
  };
}

function createContextualFallbackCorrection({
  text,
  previousAssistantMessage,
}: {
  text: string;
  previousAssistantMessage?: string;
}): Correction {
  const originalText = text.trim();

  if (isContextValidShortReply(originalText, previousAssistantMessage)) {
    const recommendedExpression = createMinimalContextPolish(
      originalText,
      previousAssistantMessage,
    );

    return {
      feedbackType: "CONTEXT_VALID",
      originalText,
      recommendedExpression,
      reason: createContextValidReason(originalText),
      scores: createFallbackScores("CONTEXT_VALID", originalText),
    };
  }

  if (isRecommendationRequest(originalText)) {
    return {
      feedbackType: "CORRECTION",
      originalText,
      recommendedExpression: "Do you have any recommendations?",
      reason:
        "这里是在泛泛询问推荐，用复数 recommendations 更自然。",
      scores: createFallbackScores("CORRECTION", originalText),
    };
  }

  return {
    feedbackType: "ENHANCEMENT",
    originalText,
    recommendedExpression: originalText,
    reason:
      "这句话可以理解。保持原意即可，只有在对话需要时再补充细节。",
    scores: createFallbackScores("ENHANCEMENT", originalText),
  };
}

function createsNewPreference(originalText: string, recommendedExpression: string) {
  return (
    !/\bprefer\b/iu.test(originalText) &&
    /\bprefer\b/iu.test(recommendedExpression)
  );
}

function createsNewReason(originalText: string, recommendedExpression: string) {
  return (
    !/\bbecause\b/iu.test(originalText) &&
    /\bbecause\b/iu.test(recommendedExpression)
  );
}

function violatesOriginalIntent(
  originalText: string,
  recommendedExpression: string,
) {
  if (
    isRecommendationRequest(originalText) &&
    !keepsRecommendationMeaning(recommendedExpression)
  ) {
    return true;
  }

  return (
    createsNewPreference(originalText, recommendedExpression) ||
    createsNewReason(originalText, recommendedExpression)
  );
}

function cleanReason({
  reason,
  fallback,
  originalText,
}: {
  reason: string;
  fallback: string;
  originalText: string;
}) {
  if (mentionsWrittenFormatting(reason) || !hasChineseText(reason)) {
    return isRecommendationRequest(originalText)
      ? "这里是在泛泛询问推荐，用复数 recommendations 更自然。"
      : fallback;
  }

  return reason;
}

function parseCorrection(
  rawContent: string,
  originalText: string,
  previousAssistantMessage?: string,
) {
  const parsed = parseJsonObject<ParsedCorrectionPayload>(rawContent);
  const fallback = createContextualFallbackCorrection({
    text: originalText,
    previousAssistantMessage,
  });
  const parsedOriginal =
    typeof parsed.originalText === "string" && parsed.originalText.trim()
      ? parsed.originalText.trim()
      : typeof parsed.original === "string" && parsed.original.trim()
        ? parsed.original.trim()
        : originalText;
  const parsedRecommended =
    typeof parsed.recommendedExpression === "string" &&
    parsed.recommendedExpression.trim()
      ? parsed.recommendedExpression.trim()
      : typeof parsed.betterExpression === "string" &&
          parsed.betterExpression.trim()
        ? parsed.betterExpression.trim()
        : typeof parsed.corrected === "string" && parsed.corrected.trim()
          ? parsed.corrected.trim()
          : fallback.recommendedExpression;
  const shouldUseFallbackRecommendation =
    violatesOriginalIntent(parsedOriginal, parsedRecommended) ||
    (isContextValidShortReply(parsedOriginal, previousAssistantMessage) &&
      countWords(parsedRecommended) > 4);
  const feedbackType = shouldUseFallbackRecommendation
    ? fallback.feedbackType
    : getCorrectionFeedbackType(parsed.feedbackType, fallback.feedbackType);
  const recommendedExpression = shouldUseFallbackRecommendation
    ? fallback.recommendedExpression
    : parsedRecommended;
  const rawReason =
    typeof parsed.reason === "string" && parsed.reason.trim()
      ? parsed.reason.trim()
      : fallback.reason;
  const scores = isScoreBreakdown(parsed.scores)
    ? parsed.scores
    : fallback.scores;

  return {
    feedbackType,
    originalText: parsedOriginal,
    recommendedExpression,
    reason: shouldUseFallbackRecommendation
      ? fallback.reason
      : cleanReason({
          reason: rawReason,
          fallback: fallback.reason,
          originalText: parsedOriginal,
        }),
    scores: floorScoresForType(scores, feedbackType, parsedOriginal),
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
  const previousAssistantMessage = body.previousAssistantMessage?.trim();
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
      ...createContextualFallbackCorrection({
        text,
        previousAssistantMessage,
      }),
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
            "You return strict JSON for English speaking feedback. Do not use markdown.",
        },
        {
          role: "user",
          content: buildCorrectionPrompt({
            text,
            scenario,
            previousAssistantMessage,
          }),
        },
      ],
      max_tokens: 420,
      temperature: 0.15,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        ...createContextualFallbackCorrection({
          text,
          previousAssistantMessage,
        }),
        provider: "fallback",
      });
    }

    return NextResponse.json({
      ...parseCorrection(content, text, previousAssistantMessage),
      provider: "deepseek",
    });
  } catch (error) {
    console.error("Correction API failed", error);

    return NextResponse.json({
      ...createContextualFallbackCorrection({
        text,
        previousAssistantMessage,
      }),
      provider: "fallback",
    });
  }
}
