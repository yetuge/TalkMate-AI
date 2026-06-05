export function extractJson(text: string) {
  const trimmedText = text.trim();
  const fencedMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmedText.indexOf("{");
  const lastBrace = trimmedText.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmedText.slice(firstBrace, lastBrace + 1);
  }

  return trimmedText;
}

export function parseJsonObject<T>(rawContent: string) {
  return JSON.parse(extractJson(rawContent)) as Partial<T>;
}
