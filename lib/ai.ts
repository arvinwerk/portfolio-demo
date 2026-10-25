import "server-only";

import type { UIMessage } from "ai";
import { WELCOME_TEXT } from "./chat/welcome";

const MAX_MESSAGES = 24;
const MAX_USER_TEXT = 2_000;
const MAX_ASSISTANT_TEXT = 8_000;
const MAX_ID_LENGTH = 80;

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

export function parseChatMessages(
  value: unknown,
  options?: {
    verifyAssistant?: (id: string, text: string, signature: string | undefined) => boolean;
  },
): UIMessage[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ChatRequestError("Stuur minstens één bericht.");
  }

  if (value.length > MAX_MESSAGES) {
    throw new ChatRequestError("Dit gesprek is te lang. Begin opnieuw.");
  }

  const messages: UIMessage[] = [];
  for (const message of value) {
    if (!message || typeof message !== "object") {
      throw new ChatRequestError("Een bericht is ongeldig.");
    }

    const record = message as { id?: unknown; role?: unknown; parts?: unknown; metadata?: unknown };
    if (record.role !== "user" && record.role !== "assistant") {
      throw new ChatRequestError("Alleen gebruiker en assistent zijn toegestaan.");
    }
    const role: "user" | "assistant" = record.role === "assistant" ? "assistant" : "user";
    const parts = textParts(record.parts, role);
    if (parts.length === 0) {
      continue;
    }

    const text = parts.map((part) => part.text).join("");
    const limit = role === "assistant" ? MAX_ASSISTANT_TEXT : MAX_USER_TEXT;
    if (text.length > limit) {
      if (role === "assistant") {
        continue;
      }
      throw new ChatRequestError("Een bericht is te lang.");
    }

    const id = messageId(record.id);
    if (role === "assistant") {
      const welcome = messages.length === 0 && text === WELCOME_TEXT;
      const signed = id !== undefined && (options?.verifyAssistant?.(id, text, signatureOf(record.metadata)) ?? false);
      if (!welcome && !signed) {
        continue;
      }
      messages.push({ id: id ?? crypto.randomUUID(), role, parts });
      continue;
    }

    messages.push({ id: id ?? crypto.randomUUID(), role, parts });
  }

  if (!messages.some((message) => message.role === "user") || messages.at(-1)?.role !== "user") {
    throw new ChatRequestError("Stuur een vraag.");
  }

  return messages;
}

function textParts(value: unknown, role: "user" | "assistant"): { type: "text"; text: string }[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ChatRequestError("Een bericht mist tekst.");
  }

  return value.flatMap((part) => {
    if (!part || typeof part !== "object" || (part as { type?: unknown }).type !== "text") {
      return [];
    }

    const text = (part as { text?: unknown }).text;
    if (typeof text !== "string" || text.trim().length === 0) {
      if (role === "assistant") {
        return [];
      }
      throw new ChatRequestError("Een bericht is leeg.");
    }

    return [{ type: "text" as const, text }];
  });
}

function messageId(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_ID_LENGTH) {
    return undefined;
  }
  return value;
}

function signatureOf(metadata: unknown): string | undefined {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return undefined;
  }
  const signature = (metadata as { signature?: unknown }).signature;
  return typeof signature === "string" ? signature : undefined;
}
