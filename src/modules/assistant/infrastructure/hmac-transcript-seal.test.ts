import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { assistantTurnMatches, signAssistantTurn } from "./hmac-transcript-seal";

describe("assistantTurnMatches", () => {
  it("herkent alleen de tekst en het id die deze server ondertekende", () => {
    const signature = signAssistantTurn("antwoord-1", "Ik woon in Utrecht.", "test-sleutel");

    expect(assistantTurnMatches("antwoord-1", "Ik woon in Utrecht.", signature, "test-sleutel")).toBe(true);
    expect(assistantTurnMatches("antwoord-1", "Ik woon in Parijs.", signature, "test-sleutel")).toBe(false);
    expect(assistantTurnMatches("antwoord-2", "Ik woon in Utrecht.", signature, "test-sleutel")).toBe(false);
    expect(assistantTurnMatches("antwoord-1", "Ik woon in Utrecht.", signature, "andere-sleutel")).toBe(false);
    expect(assistantTurnMatches("antwoord-1", "Ik woon in Utrecht.", undefined, "test-sleutel")).toBe(false);
  });
});
