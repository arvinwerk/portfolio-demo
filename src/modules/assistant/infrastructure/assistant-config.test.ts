import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { AssistantNotConfigured } from "../application/assistant-credentials";
import { readAssistantConfig } from "./assistant-config";

describe("readAssistantConfig", () => {
  it("leest model en sleutel uit de omgeving", () => {
    expect(readAssistantConfig({ AI_MODEL: " [REDACTED] ", AI_API_KEY: " sleutel " })).toEqual({
      model: "[REDACTED]",
      apiKey: "sleutel",
    });
  });

  it("weigert een ontbrekend model of een ontbrekende sleutel", () => {
    expect(() => readAssistantConfig({ AI_MODEL: "[REDACTED]" })).toThrow(AssistantNotConfigured);
    expect(() => readAssistantConfig({ AI_API_KEY: "sleutel" })).toThrow(AssistantNotConfigured);
    expect(() => readAssistantConfig({ AI_MODEL: "  ", AI_API_KEY: "sleutel" })).toThrow(AssistantNotConfigured);
  });
});
