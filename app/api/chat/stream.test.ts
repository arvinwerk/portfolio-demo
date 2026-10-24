import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { signAssistantTurn } from "@/lib/chat/transcript";
import { POST } from "./route";

function event(payload: unknown) {
  return `event: ${(payload as { type: string }).type}\ndata: ${JSON.stringify(payload)}\n\n`;
}

describe("streaming via de Anthropic-provider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("stuurt modeltekst als een stream naar de browser", async () => {
    vi.stubEnv("AI_MODEL", "claude-haiku-5-5");
    vi.stubEnv("AI_API_KEY", "test-sleutel");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        expect(headers.get("x-api-key")).toBe("test-sleutel");
        const body = JSON.parse(String(init?.body)) as { model: string };
        expect(body.model).toBe("claude-haiku-5-5");

        return new Response(
          [
            event({
              type: "message_start",
              message: {
                id: "msg_1",
                model: "claude-haiku-5-5",
                role: "assistant",
                usage: { input_tokens: 12 },
              },
            }),
            event({
              type: "content_block_start",
              index: 0,
              content_block: { type: "text", text: "" },
            }),
            event({
              type: "content_block_delta",
              index: 0,
              delta: { type: "text_delta", text: "Hallo" },
            }),
            event({
              type: "content_block_delta",
              index: 0,
              delta: { type: "text_delta", text: " daar" },
            }),
            event({ type: "content_block_stop", index: 0 }),
            event({
              type: "message_delta",
              delta: { stop_reason: "end_turn", stop_sequence: null },
              usage: { output_tokens: 2 },
            }),
            event({ type: "message_stop" }),
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