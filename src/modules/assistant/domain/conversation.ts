import { WELCOME_TEXT } from "./welcome";

const MAX_MESSAGES = 24;
const MAX_USER_TEXT = 2_000;
const MAX_ASSISTANT_TEXT = 8_000;
const MAX_ID_LENGTH = 80;

export class ConversationRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversationRejected";
  }
}

export type TranscriptTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export function asUiTurn(turn: TranscriptTurn): {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
} {
  return { id: turn.id, role: turn.role, parts: [{ type: "text", text: turn.text }] };
}

export function restoreConversation(
  value: unknown,
  options?: {
    verifyAssistant?: (id: string, text: string, signature: string | undefined) => boolean;
  },
): TranscriptTurn[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ConversationRejected("Stuur minstens één bericht.");
  }

  if (value.length > MAX_MESSAGES) {
    throw new ConversationRejected("Dit gesprek is te lang. Begin opnieuw.");
  }

  const turns: TranscriptTurn[] = [];
  for (const message of value) {
    if (!message || typeof message !== "object") {
      throw new ConversationRejected("Een bericht is ongeldig.");
    }

    const record = message as { id?: unknown; role?: unknown; parts?: unknown; metadata?: unknown };
    if (record.role !== "user" && record.role !== "assistant") {
      throw new ConversationRejected("Alleen gebruiker en assistent zijn toegestaan.");
    }
    const role: "user" | "assistant" = record.role === "assistant" ? "assistant" : "user";
    const text = turnText(record.parts, role);
    if (text === undefined) {
      continue;
    }

    const limit = role === "assistant" ? MAX_ASSISTANT_TEXT : MAX_USER_TEXT;
    if (text.length > limit) {
      if (role === "assistant") {
        continue;
      }
      throw new ConversationRejected("Een bericht is te lang.");
    }

    const id = messageId(record.id);
    if (role === "assistant") {
      const welcome = turns.length === 0 && text === WELCOME_TEXT;
      const signed = id !== undefined && (options?.verifyAssistant?.(id, text, signatureOf(record.metadata)) ?? false);
      if (!welcome && !signed) {
        continue;
      }
      turns.push({ id: id ?? crypto.randomUUID(), role, text });
      continue;
    }

    turns.push({ id: id ?? crypto.randomUUID(), role, text });
  }

  if (!turns.some((turn) => turn.role === "user") || turns.at(-1)?.role !== "user") {
    throw new ConversationRejected("Stuur een vraag.");
  }

  return turns;
}

function turnText(value: unknown, role: "user" | "assistant"): string | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ConversationRejected("Een bericht mist tekst.");
  }

  const parts = value.flatMap((part) => {
    if (!part || typeof part !== "object" || (part as { type?: unknown }).type !== "text") {
      return [];
    }

    const text = (part as { text?: unknown }).text;
    if (typeof text !== "string" || text.trim().length === 0) {
      if (role === "assistant") {
        return [];
      }
      throw new ConversationRejected("Een bericht is leeg.");
    }

    return [text];
  });

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join("");
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
