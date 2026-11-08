import "server-only";

import { AssistantNotConfigured, type AssistantCredentials } from "../application/assistant-credentials";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434/v1";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "host.docker.internal"]);

export function readAssistantConfig(env: Record<string, string | undefined> = process.env): AssistantCredentials {
  const model = env.AI_MODEL?.trim() ?? "";
  const apiKey = env.AI_API_KEY?.trim() ?? "";

  if (!model || !apiKey) {
    throw new AssistantNotConfigured();
  }

  return { model, apiKey, baseUrl: localModelUrl(env.AI_BASE_URL?.trim() || DEFAULT_BASE_URL) };
}

function localModelUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AssistantNotConfigured("AI_BASE_URL is geen geldige URL.");
  }

  if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) {
    throw new AssistantNotConfigured("AI_BASE_URL is geen geldige URL.");
  }

  const dockerName = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(url.hostname);
  if (!LOOPBACK_HOSTS.has(url.hostname) && !dockerName) {
    throw new AssistantNotConfigured("AI_BASE_URL wijst niet naar een lokaal model.");
  }

  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}
