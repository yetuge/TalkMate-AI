import OpenAI from "openai";

export const aiConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
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
