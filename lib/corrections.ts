import type { Correction, CorrectionFeedbackType } from "@/lib/types";

export function getCorrectionOriginal(correction: Correction) {
  return correction.originalText || correction.original || "";
}

export function getCorrectionRecommendation(correction: Correction) {
  return (
    correction.recommendedExpression ||
    correction.betterExpression ||
    correction.corrected ||
    getCorrectionOriginal(correction)
  );
}

export function getCorrectionFeedbackType(
  value: unknown,
  fallback: CorrectionFeedbackType = "ENHANCEMENT",
) {
  return value === "CORRECTION" ||
    value === "ENHANCEMENT" ||
    value === "CONTEXT_VALID"
    ? value
    : fallback;
}

export function withLegacyCorrectionFields(correction: Correction): Correction {
  const originalText = getCorrectionOriginal(correction);
  const recommendedExpression = getCorrectionRecommendation(correction);

  return {
    ...correction,
    originalText,
    recommendedExpression,
    original: originalText,
    corrected: recommendedExpression,
    betterExpression: recommendedExpression,
  };
}
