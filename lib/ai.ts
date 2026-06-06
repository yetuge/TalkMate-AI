import OpenAI from "openai";

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return Math.round(parsedValue);
}

export const aiConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
  chatStreamTimeoutMs: readPositiveInteger(
    process.env.DEEPSEEK_CHAT_STREAM_TIMEOUT_MS,
    15000,
  ),
};

export function hasConfiguredAiProvider() {
  return Boolean(aiConfig.apiKey);
}

export function createAiClient() {
  if (!aiConfig.apiKey) {
    return undefined;
  }

  return new OpenAI({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseURL,
  });
}
