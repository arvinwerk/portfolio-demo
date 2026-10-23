import type { UIMessage } from "ai";

const MAX_MESSAGES = 24;
const MAX_TEXT_LENGTH = 2_000;

export class AiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiConfigError";
  }
}

export class ChatRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatRequestError";
  }
}

export function readAiConfig(env: Record<string, string | undefined> = process.env): {
  model: string;
  apiKey: string;
} {
  const model = env.AI_MODEL?.trim() ?? "";
  const apiKey = env.AI_API_KEY?.trim() ?? "";

  if (!model || !apiKey) {
    throw new AiConfigError("Zet AI_MODEL en AI_API_KEY.");
  }

  return { model, apiKey };
}

export function parseChatMessages(value: unknown): UIMessage[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ChatRequestError("Stuur minstens één bericht.");
  }

  if (value.length > MAX_MESSAGES) {
    throw new ChatRequestError("Dit gesprek is te lang. Begin opnieuw.");
  }

  const messages = value.flatMap((message) => {
    if (!message || typeof message !== "object") {
      throw new ChatRequestError("Een bericht is ongeldig.");
    }

    const record = message as { id?: unknown; role?: unknown; parts?: unknown };
    if (record.role !== "user" && record.role !== "assistant") {
      throw new ChatRequestError("Alleen gebruiker en assistent zijn toegestaan.");
    }
    const role: "user" | "assistant" = record.role === "assistant" ? "assistant" : "user";

    if (!Array.isArray(record.parts) || record.parts.length === 0) {
      throw new ChatRequestError("Een bericht mist tekst.");
    }

    const parts = record.parts.flatMap((part) => {
      if (!part || typeof part !== "object" || (part as { type?: unknown }).type !== "text") {
        return [];
      }

      const text = (part as { text?: unknown }).text;
      if (typeof text !== "string" || text.trim().length === 0) {
        throw new ChatRequestError("Een bericht is leeg.");
      }

      if (text.length > MAX_TEXT_LENGTH) {
        throw new ChatRequestError("Een bericht is te lang.");
      }

      return [{ type: "text" as const, text }];
    });

    if (parts.length === 0) {
      return [];
    }

    const id = typeof record.id === "string" && record.id.length > 0 ? record.id : crypto.randomUUID();
    return [{ id, role, parts }];
  });

  if (messages.length === 0) {
    throw new ChatRequestError("Stuur minstens één bericht.");
  }

  return messages;
}
