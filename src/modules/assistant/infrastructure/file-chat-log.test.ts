import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { ChatTranscript } from "../domain/chat-transcript";
import { ChatLogError, FileChatLog, renderChatLog } from "./file-chat-log";

const directories: string[] = [];

function tempDirectory(): string {
  const directory = mkdtempSync(path.join(os.tmpdir(), "chat-log-"));
  directories.push(directory);
  return directory;
}

function transcript(id: string, turns: ChatTranscript["turns"]): ChatTranscript {
  return { id, updatedAt: "2026-11-08T16:47:00.000Z", turns };
}

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("FileChatLog", () => {
  it("schrijft één bestand per gesprek en vervangt het bij de volgende beurt", async () => {
    const directory = tempDirectory();
    const log = new FileChatLog({ CHAT_LOG_DIR: directory });

    await log.save(
      transcript("vraag-1", [
        { role: "user", text: "Kun je Angular?" },
        { role: "assistant", text: "Ja. Angular staat bij de vaardigheden." },
      ]),
    );
    await log.save(
      transcript("vraag-1", [
        { role: "user", text: "Kun je Angular?" },
        { role: "assistant", text: "Ja. Angular staat bij de vaardigheden." },
        { role: "user", text: "En Laravel?" },
        { role: "assistant", text: "Ja. Laravel staat bij de vaardigheden." },
      ]),
    );
    await log.save(transcript("ander-gesprek", [{ role: "user", text: "Waar woon je?" }]));

    expect(readdirSync(directory).sort()).toEqual(["ander-gesprek.txt", "vraag-1.txt"]);
    expect(readFileSync(path.join(directory, "vraag-1.txt"), "utf8")).toBe(
      renderChatLog(
        transcript("vraag-1", [
          { role: "user", text: "Kun je Angular?" },
          { role: "assistant", text: "Ja. Angular staat bij de vaardigheden." },
          { role: "user", text: "En Laravel?" },
          { role: "assistant", text: "Ja. Laravel staat bij de vaardigheden." },
        ]),
      ),
    );
    expect(readFileSync(path.join(directory, "vraag-1.txt"), "utf8")).toContain("bezoeker\nEn Laravel?");
    expect(readFileSync(path.join(directory, "vraag-1.txt"), "utf8")).toContain("assistent\nJa. Laravel staat bij de vaardigheden.");
  });

  it("houdt een onveilige gespreksnaam binnen de map", async () => {
    const directory = tempDirectory();
    const outside = tempDirectory();
    const log = new FileChatLog({ CHAT_LOG_DIR: directory });

    await log.save(transcript("../geheim", [{ role: "user", text: "Hoi" }]));

    expect(readdirSync(directory).every((name) => name.endsWith(".txt"))).toBe(true);
    expect(readdirSync(outside)).toEqual([]);
    expect(readFileSync(path.join(directory, readdirSync(directory)[0] ?? ""), "utf8")).toContain("gesprek: ../geheim");
  });

  it("weigert een relatief pad", async () => {
    const log = new FileChatLog({ CHAT_LOG_DIR: "data/chat" });
    await expect(log.save(transcript("vraag-1", [{ role: "user", text: "Hoi" }]))).rejects.toBeInstanceOf(ChatLogError);
  });

  it("legt het gesprek onder CONTENT_DIR/chat", async () => {
    const directory = tempDirectory();
    const log = new FileChatLog({ CONTENT_DIR: directory });

    await log.save(transcript("vraag-1", [{ role: "user", text: "Hoi" }]));

    expect(readFileSync(path.join(directory, "chat", "vraag-1.txt"), "utf8")).toContain("bezoeker\nHoi");
  });
});
