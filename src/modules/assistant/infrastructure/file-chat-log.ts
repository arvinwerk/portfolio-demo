import "server-only";

import { createHash } from "node:crypto";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ChatLog } from "../application/chat-log";
import type { ChatTranscript } from "../domain/chat-transcript";

const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;

export class ChatLogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatLogError";
  }
}

export class FileChatLog implements ChatLog {
  constructor(private readonly env: Record<string, string | undefined> = process.env) {}

  async save(transcript: ChatTranscript): Promise<void> {
    const directory = logDirectory(this.env);
    mkdirSync(directory, { recursive: true });
    const target = resolveInside(directory, fileName(transcript.id));
    const temporary = path.join(directory, `.${path.basename(target)}.${process.pid}.tmp`);
    writeFileSync(temporary, renderChatLog(transcript), "utf8");
    renameSync(temporary, target);
  }
}

export function renderChatLog(transcript: ChatTranscript): string {
  const turns = transcript.turns
    .map((turn) => `${turn.role === "user" ? "bezoeker" : "assistent"}\n${turn.text}`)
    .join("\n\n");
  return `gesprek: ${transcript.id}\nbijgewerkt: ${transcript.updatedAt}\n\n${turns}\n`;
}

function logDirectory(env: Record<string, string | undefined>): string {
  const configured = env.CHAT_LOG_DIR?.trim() ?? "";
  if (configured.length > 0) {
    return absoluteDirectory(configured, "CHAT_LOG_DIR");
  }

  const content = env.CONTENT_DIR?.trim() ?? "";
  if (content.length > 0) {
    return path.join(absoluteDirectory(content, "CONTENT_DIR"), "chat");
  }

  return path.join(process.cwd(), "data", "chat");
}

function absoluteDirectory(value: string, name: string): string {
  if (!path.isAbsolute(value)) {
    throw new ChatLogError(`${name} moet een absoluut pad zijn.`);
  }
  return path.resolve(value);
}

function fileName(id: string): string {
  const base = SAFE_NAME.test(id) ? id : createHash("sha256").update(id).digest("hex").slice(0, 32);
  return `${base}.txt`;
}

function resolveInside(directory: string, name: string): string {
  const root = path.resolve(directory);
  const target = path.resolve(root, name);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new ChatLogError("Het gesprek blijft in de logmap.");
  }
  return target;
}
