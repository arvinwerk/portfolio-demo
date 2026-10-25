import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { assistantTurnMatches, signAssistantTurn } from "./transcript";

describe("assistantTurnMatches", () => {
  it("herkent alleen de tekst en het id die deze server ondertekende", () => {
    const signature = signAssistantTurn("antwoord-1", "Ik woon in Kadewijk.", "test-sleutel");

    expect(assistantTurnMatches("antwoord-1", "Ik woon in Kadewijk.", signature, "test-sleutel")).toBe(true);
    expect(assistantTurnMatches("antwoord-1", "Ik woon in Parijs.", signature, "test-sleutel")).toBe(false);
    expect(assistantTurnMatches("antwoord-2", "Ik woon in Kadewijk.", signature, "test-sleutel")).toBe(false);
    expect(assistantTurnMatches("antwoord-1", "Ik woon in Kadewijk.", signature, "andere-sleutel")).toBe(false);
    expect(assistantTurnMatches("antwoord-1", "Ik woon in Kadewijk.", undefined, "test-sleutel")).toBe(false);
  });
});
