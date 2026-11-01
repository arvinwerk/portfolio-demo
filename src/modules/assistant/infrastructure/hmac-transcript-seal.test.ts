import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { assistantTurnMatches, signAssistantTurn } from "./hmac-transcript-seal";

describe("assistantTurnMatches", () => {
  const context = "vooraf";

  it("herkent alleen de tekst, het id en de voorgeschiedenis die deze server ondertekende", () => {
    const signature = signAssistantTurn("antwoord-1", "Ik woon in Kadewijk.", context, "test-sleutel");

    expect(assistantTurnMatches("antwoord-1", "Ik woon in Kadewijk.", context, signature, "test-sleutel")).toBe(true);
    expect(assistantTurnMatches("antwoord-1", "Ik woon in Parijs.", context, signature, "test-sleutel")).toBe(false);
    expect(assistantTurnMatches("antwoord-2", "Ik woon in Kadewijk.", context, signature, "test-sleutel")).toBe(false);
    expect(assistantTurnMatches("antwoord-1", "Ik woon in Kadewijk.", "andere", signature, "test-sleutel")).toBe(false);
    expect(assistantTurnMatches("antwoord-1", "Ik woon in Kadewijk.", context, signature, "andere-sleutel")).toBe(false);
    expect(assistantTurnMatches("antwoord-1", "Ik woon in Kadewijk.", context, undefined, "test-sleutel")).toBe(false);
  });

  it("weigert een handtekening waarvan de newline tussen id en tekst is verschoven", () => {
    const text = "Ik woon\nin Kadewijk.";
    const signature = signAssistantTurn("antwoord-1", text, context, "test-sleutel");

    expect(assistantTurnMatches("antwoord-1\nIk woon", "in Kadewijk.", context, signature, "test-sleutel")).toBe(false);
  });
});
