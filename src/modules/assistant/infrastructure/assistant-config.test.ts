import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { AssistantNotConfigured } from "../application/assistant-credentials";
import { readAssistantConfig } from "./assistant-config";

describe("readAssistantConfig", () => {
  it("leest model, sleutel en het lokale adres", () => {
    expect(
      readAssistantConfig({
        AI_MODEL: " qwen ",
        AI_API_KEY: " sleutel ",
        AI_BASE_URL: " http://qwen:11434/v1/ ",
      }),
    ).toEqual({
      model: "qwen",
      apiKey: "sleutel",
      baseUrl: "http://qwen:11434/v1",
    });
  });

  it("wijst zonder adres naar Ollama op deze machine", () => {
    expect(readAssistantConfig({ AI_MODEL: "qwen", AI_API_KEY: "sleutel", AI_BASE_URL: "  " })).toEqual({
      model: "qwen",
      apiKey: "sleutel",
      baseUrl: "http://127.0.0.1:11434/v1",
    });
    expect(readAssistantConfig({ AI_MODEL: "qwen", AI_API_KEY: "sleutel" }).baseUrl).toBe("http://127.0.0.1:11434/v1");
    expect(readAssistantConfig({ AI_MODEL: "qwen", AI_API_KEY: "sleutel", AI_BASE_URL: "http://localhost:11434/v1" }).baseUrl).toBe(
      "http://localhost:11434/v1",
    );
    expect(
      readAssistantConfig({ AI_MODEL: "qwen", AI_API_KEY: "sleutel", AI_BASE_URL: "http://host.docker.internal:11434/v1" }).baseUrl,
    ).toBe("http://host.docker.internal:11434/v1");
  });

  it("weigert een ontbrekend model of een ontbrekende sleutel", () => {
    expect(() => readAssistantConfig({ AI_MODEL: "qwen" })).toThrow(AssistantNotConfigured);
    expect(() => readAssistantConfig({ AI_API_KEY: "sleutel" })).toThrow(AssistantNotConfigured);
    expect(() => readAssistantConfig({ AI_MODEL: "  ", AI_API_KEY: "sleutel" })).toThrow(AssistantNotConfigured);
    expect(() => readAssistantConfig({ AI_BASE_URL: "https://api.openai.com/v1" })).toThrow("Zet AI_MODEL en AI_API_KEY.");
  });

  it("weigert een adres dat niet lokaal is", () => {
    expect(() => readAssistantConfig({ AI_MODEL: "qwen", AI_API_KEY: "sleutel", AI_BASE_URL: "niet een url" })).toThrow(
      "AI_BASE_URL is geen geldige URL.",
    );
    expect(() => readAssistantConfig({ AI_MODEL: "qwen", AI_API_KEY: "sleutel", AI_BASE_URL: "ftp://127.0.0.1/v1" })).toThrow(
      "AI_BASE_URL is geen geldige URL.",
    );
    expect(() =>
      readAssistantConfig({ AI_MODEL: "qwen", AI_API_KEY: "sleutel", AI_BASE_URL: "http://user:wachtwoord@127.0.0.1:11434/v1" }),
    ).toThrow("AI_BASE_URL is geen geldige URL.");
    expect(() => readAssistantConfig({ AI_MODEL: "qwen", AI_API_KEY: "sleutel", AI_BASE_URL: "https://api.openai.com/v1" })).toThrow(
      "AI_BASE_URL wijst niet naar een lokaal model.",
    );
  });
});
