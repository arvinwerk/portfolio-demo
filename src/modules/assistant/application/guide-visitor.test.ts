import { describe, expect, it, vi } from "vitest";
import type { VisitorGate } from "./visitor-gate";
import { guideVisitor, type GuidanceInterpreter } from "./guide-visitor";

const open: VisitorGate = { consume: () => ({ allowed: true }) };

describe("guideVisitor", () => {
  it("beantwoordt een bekende vraag uit de catalogus zonder het model", async () => {
    const interpret = vi.fn();
    const plan = await guideVisitor({
      text: "Explain your architecture decisions.",
      address: "127.0.0.1",
      gate: { consume: () => ({ allowed: false, retryAfterSeconds: 9 }) },
      interpreter: { interpret },
    });

    expect(plan).toMatchObject({
      kind: "ready",
      guidance: { surface: "thinking", focus: "dependency-rule", origin: "catalog" },
    });
    expect(interpret).not.toHaveBeenCalled();
  });

  it("vraagt het model alleen als de catalogus niets heeft, en valt terug als de vorm faalt", async () => {
    const interpreter: GuidanceInterpreter = {
      interpret: async () => ({
        surface: "experiments",
        focus: null,
        explanation: "Dit komt van het model en blijft een zin.",
      }),
    };
    const plan = await guideVisitor({
      text: "iets dat niet in de lijst staat",
      address: "127.0.0.1",
      gate: open,
      interpreter,
    });
    expect(plan).toMatchObject({ kind: "ready", guidance: { surface: "experiments", origin: "model" } });

    const broken: GuidanceInterpreter = { interpret: async () => ({ surface: "eval", explanation: "code" }) };
    const fallback = await guideVisitor({
      text: "iets dat niet in de lijst staat",
      address: "127.0.0.1",
      gate: open,
      interpreter: broken,
    });
    expect(fallback).toMatchObject({ kind: "ready", guidance: { surface: "portrait", origin: "catalog" } });
  });

  it("laat het tempo het model tegenhouden", async () => {
    const plan = await guideVisitor({
      text: "iets dat niet in de lijst staat",
      address: "127.0.0.1",
      gate: { consume: () => ({ allowed: false, retryAfterSeconds: 12 }) },
      interpreter: { interpret: async () => ({ surface: "work", focus: null, explanation: "Projecten." }) },
    });
    expect(plan).toEqual({ kind: "limited", retryAfterSeconds: 12 });
  });
});
