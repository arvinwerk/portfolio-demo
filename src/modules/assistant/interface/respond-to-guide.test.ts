import { describe, expect, it, vi } from "vitest";
import type { ProfileKnowledge } from "../domain/profile-knowledge";
import { respondToGuide } from "./respond-to-guide";
import { respondToProbe } from "./respond-to-probe";

const open = { consume: () => ({ allowed: true as const }) };

describe("respondToGuide", () => {
  it("geeft een catalogusantwoord zonder het model te vragen", async () => {
    const interpret = vi.fn();
    const response = await respondToGuide(new Request("http://localhost/api/guide", { method: "POST", body: JSON.stringify({ text: "Verken je projecten." }) }), {
      gate: open,
      interpreter: () => ({ interpret }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ surface: "work", origin: "catalog" });
    expect(interpret).not.toHaveBeenCalled();
  });

  it("weigert een lege vraag", async () => {
    const response = await respondToGuide(new Request("http://localhost/api/guide", { method: "POST", body: JSON.stringify({ text: "  " }) }), {
      gate: open,
      interpreter: () => null,
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Ongeldig verzoek." });
  });
});

describe("respondToProbe", () => {
  it("geeft de fragmenten uit de profielkennis terug", async () => {
    const knowledge: ProfileKnowledge = {
      search: async () => ({ found: true, fragments: [{ source: "profile.txt", text: "Noor bouwt interfaces." }] }),
    };
    const response = await respondToProbe(
      new Request("http://localhost/api/probe", { method: "POST", body: JSON.stringify({ query: "interfaces" }) }),
      { gate: open, knowledge },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      found: true,
      fragments: [{ source: "profile.txt", text: "Noor bouwt interfaces." }],
      note: null,
    });
  });
});
