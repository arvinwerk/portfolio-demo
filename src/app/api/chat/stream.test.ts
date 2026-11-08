import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { signAssistantTurn } from "@/modules/assistant/server";
import { POST } from "./route";

describe("het recruiterantwoord in de stream", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("stuurt de zin uit het blad, ondertekend, zonder een modelverzoek", async () => {
    vi.stubEnv("AI_MODEL", "test-model");
    vi.stubEnv("AI_API_KEY", "test-sleutel");
    vi.stubEnv("AI_BASE_URL", "");
    const fetchMock = vi.fn();
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
    expect(fetchMock).not.toHaveBeenCalled();
    const text = await response.text();
    const answer = "Mijn opleiding is informatica aan de Voorbeeld Hogeschool, afgerond in 2015.";
    expect(text).toContain(answer);
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
  });
});
