import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { signAssistantTurn } from "@/modules/assistant/server";
import { POST } from "./route";

function chunk(payload: unknown) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

describe("streaming via het lokale Qwen-model", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("stuurt modeltekst als een stream naar de browser", async () => {
    vi.stubEnv("AI_MODEL", "test-model");
    vi.stubEnv("AI_API_KEY", "test-sleutel");
    vi.stubEnv("AI_BASE_URL", "");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const target = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        expect(target).toBe("http://127.0.0.1:11434/v1/chat/completions");
        const headers = new Headers(init?.headers);
        expect(headers.get("authorization")).toBeNull();
        const body = JSON.parse(String(init?.body)) as { model: string };
        expect(body.model).toBe("test-model");
        expect(JSON.stringify(body)).not.toContain("test-sleutel");

        return new Response(
          [
            chunk({
              id: "chatcmpl-1",
              model: "test-model",
              choices: [{ delta: { role: "assistant", content: "Hallo" }, finish_reason: null }],
            }),
            chunk({
              id: "chatcmpl-1",
              model: "test-model",
              choices: [{ delta: { content: " daar" }, finish_reason: null }],
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
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "Hoi" }] }],
        }),
      }),
    );

    expect(response.headers.get("content-type")).toContain("text/event-stream");
    const text = await response.text();
    expect(text).toContain("Hallo");
    expect(text).toContain("daar");
    expect(text).not.toContain("test-sleutel");
    const events = text.split("\n").flatMap((line) => {
      if (!line.startsWith("data: ") || line.slice(6) === "[DONE]") {
        return [];
      }
      return [JSON.parse(line.slice(6)) as { type?: string; messageId?: string; messageMetadata?: { signature?: string } }];
    });
    const messageId = events.find((event) => event.type === "start")?.messageId;
    const signature = events.find((event) => event.type === "finish")?.messageMetadata?.signature;
    expect(signature).toBe(signAssistantTurn(messageId ?? "", "Hallo daar", "test-sleutel"));
  });
});
