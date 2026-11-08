import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { signAssistantTurn } from "@/modules/assistant/server";
import { POST } from "./route";

function chunk(payload: unknown) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function modelResponse(text: string) {
  return new Response(
    [
      chunk({
        id: "chatcmpl-1",
        model: "test-model",
        choices: [{ delta: { role: "assistant", content: text }, finish_reason: null }],
      }),
      chunk({
        id: "chatcmpl-1",
        model: "test-model",
        choices: [{ delta: {}, finish_reason: "stop" }],
      }),
      "data: [DONE]\n\n",
    ].join(""),
    { status: 200, headers: { "content-type": "text/event-stream" } },
  );
}

describe("het modelantwoord in de stream", () => {
  const directories: string[] = [];

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    for (const directory of directories.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("stuurt de tekst van het model, ondertekend, met het blad in het verzoek", async () => {
    const logDirectory = mkdtempSync(path.join(os.tmpdir(), "chat-log-"));
    directories.push(logDirectory);
    vi.stubEnv("AI_MODEL", "test-model");
    vi.stubEnv("AI_API_KEY", "test-sleutel");
    vi.stubEnv("AI_BASE_URL", "");
    vi.stubEnv("CHAT_LOG_DIR", logDirectory);
    const answer = "Ik heb informatica gedaan aan de Voorbeeld Hogeschool.";
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => modelResponse(answer));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "Wat is je opleiding?" }] }],
        }),
      }),
    );

    expect(response.headers.get("content-type")).toContain("text/event-stream");
    const text = await response.text();
    expect(fetchMock).toHaveBeenCalledOnce();
    const init = fetchMock.mock.calls[0]?.[1];
    const request = String(init?.body);
    expect(request).toContain("Wat is je opleiding?");
    expect(request).toContain("informatica aan de Voorbeeld Hogeschool, afgerond in 2015");
    expect(request).not.toContain("test-sleutel");
    expect(new Headers(init?.headers).get("authorization")).toBeNull();
    expect(text).toContain(answer);
    expect(text).not.toContain("Mijn opleiding is informatica aan de Voorbeeld Hogeschool, afgerond in 2015.");
    expect(text).not.toContain("test-sleutel");
    const events = text.split("\n").flatMap((line) => {
      if (!line.startsWith("data: ") || line.slice(6) === "[DONE]") {
        return [];
      }
      return [JSON.parse(line.slice(6)) as { type?: string; messageId?: string; messageMetadata?: { signature?: string } }];
    });
    const messageId = events.find((event) => event.type === "start")?.messageId;
    const signature = events.find((event) => event.type === "finish")?.messageMetadata?.signature;
    expect(signature).toBe(signAssistantTurn(messageId ?? "", answer, "test-sleutel"));

    const log = readFileSync(path.join(logDirectory, "1.txt"), "utf8");
    expect(log).toContain("gesprek: 1");
    expect(log).toContain("bezoeker\nWat is je opleiding?");
    expect(log).toContain(`assistent\n${answer}`);
    expect(log).not.toContain("test-sleutel");
  });

  it("geeft de vaste zin als het model niet bereikbaar is", async () => {
    vi.stubEnv("AI_MODEL", "test-model");
    vi.stubEnv("AI_API_KEY", "test-sleutel");
    vi.stubEnv("AI_BASE_URL", "");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("connect ECONNREFUSED 127.0.0.1:11434");
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "Wie ben je?" }] }],
        }),
      }),
    );

    const text = await response.text();
    expect(text).toContain("Het antwoord lukte niet. Probeer het opnieuw.");
    expect(text).not.toContain("ECONNREFUSED");
    expect(text).not.toContain("test-sleutel");
  });
});
