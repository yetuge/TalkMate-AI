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
  previousAssistantMessage?: string;
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

function mentionsWrittenFormatting(reason: string) {
  return /capital|uppercase|lowercase|punctuation|comma|spacing|period|question mark|大写|小写|首字母|标点|逗号|空格|句号|问号/iu.test(
    reason,
  );
}

function hasRecommendationPluralIssue(original: string, recommended: string) {
  const originalText = original.toLowerCase();
  const recommendedText = recommended.toLowerCase();

  return (
    /\bany recommendation\b/u.test(originalText) ||
    (/\brecommendation\b/u.test(originalText) &&
      (/\brecommendations\b/u.test(recommendedText) ||
        /\brecommend\b/u.test(recommendedText)))
  );
}

function createMeaningfulReason({
  original,
  recommended,
  fallbackReason,
}: {
  original: string;
  recommended: string;
  fallbackReason: string;
}) {
  if (hasRecommendationPluralIssue(original, recommended)) {
    return "这句话可以理解。这里是在询问推荐内容，用复数 recommendations，或者直接说 recommend something 会更自然。";
  }

  return fallbackReason;
}

function isAffirmativeAnswer(text: string) {
  return /^(yes|yeah|yep|sure|ok|okay|please|yesplease|yespleas)$/u.test(
    normalizeMeaningText(text),
  );
}

function isNegativeAnswer(text: string) {
  return /^(no|nope|notnow|nothanks|nothankyou)$/u.test(
    normalizeMeaningText(text),
  );
}

function isChoiceQuestion(text?: string) {
  if (!text) {
    return false;
  }

  return /\bor\b/i.test(text) && /\?/.test(text);
}

function createContextualAffirmativeExpansion(
  scenario?: Scenario,
  previousAssistantMessage?: string,
) {
  const previousQuestion = previousAssistantMessage?.toLowerCase() ?? "";

  if (
    scenario?.id === "travel" &&
    previousQuestion.includes("book a hotel")
  ) {
    return "Yes, please. Could you help me book a hotel near the beach?";
  }

  if (
    scenario?.id === "travel" &&
    previousQuestion.includes("transportation")
  ) {
    return "Yes, please. Could you help me arrange transportation?";
  }

  if (scenario?.id === "travel") {
    return "Yes, please. Could you help me with that?";
  }

  if (scenario?.id === "restaurant-ordering") {
    return "Yes, please. I would like that.";
  }

  if (scenario?.id === "job-interview") {
    return "Yes, I would be happy to explain.";
  }

  return "Yes, please. That would be helpful.";
}

function createScenarioExpansion(
  text: string,
  scenario?: Scenario,
  previousAssistantMessage?: string,
) {
  const normalizedText = text.trim().toLowerCase();

  if (normalizedText.includes("taxi")) {
    return "I prefer taking a taxi because it is faster and more convenient.";
  }

  if (isAffirmativeAnswer(normalizedText)) {
    return createContextualAffirmativeExpansion(
      scenario,
      previousAssistantMessage,
    );
  }

  if (isNegativeAnswer(normalizedText)) {
    return "No, thank you. I would prefer another option.";
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

function createFallbackCorrection({
  text,
  scenario,
  previousAssistantMessage,
}: {
  text: string;
  scenario?: Scenario;
  previousAssistantMessage?: string;
}): Correction {
  const trimmedText = text.trim();
  const isShortAnswer = countWords(trimmedText) <= 3;
  const spokenExpansion = createScenarioExpansion(
    trimmedText,
    scenario,
    previousAssistantMessage,
  );
  const isContextualChoiceAnswer =
    isShortAnswer &&
    isChoiceQuestion(previousAssistantMessage) &&
    isAffirmativeAnswer(trimmedText);

  return {
    original: trimmedText,
    corrected: isShortAnswer ? spokenExpansion : trimmedText,
    reason: isContextualChoiceAnswer
      ? "这句话能回应对方，但上一轮问题提供了多个选择，最好明确说明你想选哪一个。"
      : "这句话可以理解。作为口语回答，它还可以补充具体需求或原因，让对话更完整自然。",
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
  previousAssistantMessage?: string,
) {
  const parsed = parseJsonObject<Correction>(rawContent);
  const fallback = createFallbackCorrection({
    text: originalText,
    scenario,
    previousAssistantMessage,
  });
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
  const meaningfulReason = mentionsWrittenFormatting(reason)
    ? createMeaningfulReason({
        original,
        recommended: betterExpression || corrected,
        fallbackReason: fallback.reason,
      })
    : reason;

  if (differsOnlyByWrittenFormatting(original, corrected)) {
    return {
      original,
      corrected: original,
      reason: createMeaningfulReason({
        original,
        recommended: betterExpression,
        fallbackReason:
          "这句话可以理解。作为口语回答已经能表达意思，也可以进一步补充具体需求或原因。",
      }),
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
    reason: meaningfulReason,
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
      ...createFallbackCorrection({
        text,
        scenario,
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
            "You return strict JSON for English correction tasks. Do not use markdown.",
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
      max_tokens: 360,
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        ...createFallbackCorrection({
          text,
          scenario,
          previousAssistantMessage,
        }),
        provider: "fallback",
      });
    }

    return NextResponse.json({
      ...parseCorrection(content, text, scenario, previousAssistantMessage),
      provider: "deepseek",
    });
  } catch (error) {
    console.error("Correction API failed", error);

    return NextResponse.json({
      ...createFallbackCorrection({
        text,
        scenario,
        previousAssistantMessage,
      }),
      provider: "fallback",
    });
  }
}
