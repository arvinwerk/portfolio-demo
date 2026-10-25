import "server-only";

import { AssistantNotConfigured, type AssistantCredentials } from "../application/assistant-credentials";

export function readAssistantConfig(env: Record<string, string | undefined> = process.env): AssistantCredentials {
  const model = env.AI_MODEL?.trim() ?? "";
  const apiKey = env.AI_API_KEY?.trim() ?? "";

  if (!model || !apiKey) {
    throw new AssistantNotConfigured();
  }

  return { model, apiKey };
}
