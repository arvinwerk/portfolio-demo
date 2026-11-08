import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { AssistantCredentials } from "../application/assistant-credentials";
import { MISSING_FACT } from "../domain/charter";
import { parseIsoDate } from "../domain/iso-date";
import type { ProfileKnowledge } from "../domain/profile-knowledge";
import type { RecruiterFacts } from "../domain/recruiter-facts";
import { createLocalQwenSession } from "./local-qwen-session";

const now = new Date(2026, 10, 8);

const facts: RecruiterFacts = {
  name: "Noor Linden",
  role: "frontend developer",
  residence: "Kadewijk",
  education: "informatica aan de Voorbeeld Hogeschool, afgerond in 2015",
  bornOn: parseIsoDate("1993-04-18"),
  interfacesSince: parseIsoDate("2015-08-03"),
  currentWork: "sinds 2023 onder de naam Atelier Linden",
  skills: ["TypeScript", "Angular", "Laravel"],
  projects: [
    { client: "Festival Noordlicht", title: "Lichtarrangementen", stack: ["Angular", "TypeScript"] },
    { client: "Circuit Meridiaan", title: "Baan VIP", stack: ["Angular", "Laravel"] },
    { client: "Haven & Co", title: "content-API", stack: ["Laravel"] },
  ],
  contact: "noor.linden@example.com",
  github: "example.com/demo/noor-linden",
};

const credentials: AssistantCredentials = {
  model: "qwen",
  apiKey: "test-sleutel",
  baseUrl: "http://127.0.0.1:11434/v1",
};

const knowledge: ProfileKnowledge = {
  async search() {
    return { found: false, fragments: [] };
  },
  async facts() {
    return facts;
  },
};

function chunk(payload: unknown) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function modelResponse(text: string) {
  return new Response(
    [
      chunk({
        id: "chatcmpl-1",
        model: "qwen",
        choices: [{ delta: { role: "assistant", content: text }, finish_reason: null }],
      }),
      chunk({
        id: "chatcmpl-1",
        model: "qwen",
        choices: [{ delta: {}, finish_reason: "stop" }],
      }),
      "data: [DONE]\n\n",
    ].join(""),
    { status: 200, headers: { "content-type": "text/event-stream" } },
  );
}

async function spoken(stream: ReadableStream<{ type: string; text?: string }>): Promise<string> {
  const reader = stream.getReader();
  let text = "";
  for (;;) {
    const next = await reader.read();
    if (next.done) {
      return text;
    }
    if (next.value.type === "text-delta" && next.value.text) {
      text += next.value.text;
    }
  }
}

describe("createLocalQwenSession", () => {
  it("streamt de tekst van het model en stuurt het hele blad mee", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      modelResponse("Angular gebruik ik bij Festival Noordlicht en bij Circuit Meridiaan."),
    );
    vi.stubGlobal("fetch", fetchMock);

    const session = createLocalQwenSession(credentials, knowledge, now);
    const { stream } = await session.stream([
      { id: "1", role: "user", text: "Kun je ook Angular programmeren?" },
    ]);

    expect(await spoken(stream)).toBe("Angular gebruik ik bij Festival Noordlicht en bij Circuit Meridiaan.");
    expect(fetchMock).toHaveBeenCalledOnce();

    const [input, init] = fetchMock.mock.calls[0] ?? [];
    if (!init?.body) {
      throw new Error("Het modelverzoek mist een body.");
    }
    const target = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    expect(target).toBe("http://127.0.0.1:11434/v1/chat/completions");
    const headers = new Headers(init.headers);
    expect(headers.get("authorization")).toBeNull();

    const body = JSON.parse(String(init.body)) as { model?: string; temperature?: number; messages?: unknown };
    expect(body.model).toBe("qwen");
    expect(body.temperature).toBe(0.2);
    const prompt = JSON.stringify(body.messages);
    expect(prompt).toContain("Kun je ook Angular programmeren?");
    expect(prompt).toContain("Leeftijd: 33 jaar");
    expect(prompt).toContain("Jaren interfaces: 11");
    expect(prompt).toContain("Vaardigheden: TypeScript, Angular, Laravel");
    expect(prompt).toContain("Festival Noordlicht, Lichtarrangementen. Stack: Angular, TypeScript.");
    expect(prompt).toContain("Circuit Meridiaan, Baan VIP. Stack: Angular, Laravel.");
    expect(prompt).toContain("Haven & Co, content-API. Stack: Laravel.");
    expect(prompt).toContain(MISSING_FACT);
    expect(prompt).not.toContain("test-sleutel");
    expect(prompt).not.toContain("Ja. Angular staat bij de vaardigheden.");

    vi.unstubAllGlobals();
  });
});
