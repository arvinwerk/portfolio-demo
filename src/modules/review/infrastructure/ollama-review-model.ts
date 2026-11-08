import "server-only";

import { ReviewModelError, type ReviewModel } from "../domain/ports";

export class ReviewConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewConfigError";
  }
}

export type OllamaTarget = {
  baseUrl: string;
  model: string;
};

export function readOllamaTarget(env: Record<string, string | undefined> = process.env): OllamaTarget {
  const baseUrl = (env.OLLAMA_URL?.trim() || "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = env.QWEN_MODEL?.trim() || "qwen";
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new ReviewConfigError("OLLAMA_URL is ongeldig.");
  }
  if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password || url.search || url.hash) {
    throw new ReviewConfigError("OLLAMA_URL mag geen sleutel of query bevatten.");
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(model)) {
    throw new ReviewConfigError("QWEN_MODEL is ongeldig.");
  }
  return { baseUrl: url.origin + url.pathname.replace(/\/$/, ""), model };
}

export function createOllamaReviewModel(
  target: OllamaTarget,
  fetchImpl: typeof fetch = fetch,
): ReviewModel {
  return {
    async complete(brief: string): Promise<string> {
      let response: Response;
      try {
        response = await fetchImpl(`${target.baseUrl}/api/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model: target.model,
            stream: false,
            messages: [
              {
                role: "system",
                content:
                  "Je schrijft een kort Nederlands reviewrapport. Je herhaalt geen sleutels, wachtwoorden, adressen of paden.",
              },
              { role: "user", content: brief },
            ],
            options: { temperature: 0.3, num_predict: 700 },
          }),
          signal: AbortSignal.timeout(120_000),
        });
      } catch {
        throw new ReviewModelError();
      }
      if (!response.ok) {
        throw new ReviewModelError();
      }
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new ReviewModelError();
      }
      const content = readContent(payload);
      if (content.length === 0) {
        throw new ReviewModelError();
      }
      return content;
    },
  };
}

function readContent(payload: unknown): string {
  if (typeof payload !== "object" || payload === null || !("message" in payload)) {
    return "";
  }
  const message = payload.message;
  if (typeof message !== "object" || message === null || !("content" in message)) {
    return "";
  }
  return typeof message.content === "string" ? message.content : "";
}
