import { describe, expect, it } from "vitest";
import { assessChoice, designChallenge } from "./design-challenge";

describe("designChallenge", () => {
  const task = designChallenge();

  it("heeft per stap precies één keuze die deze pagina ook maakt", () => {
    expect(task.steps).toHaveLength(4);
    for (const step of task.steps) {
      expect(step.options.filter((option) => option.builtThisWay)).toHaveLength(1);
    }
  });

  it("beoordeelt een bekende keuze en weigert een onbekende", () => {
    expect(assessChoice(task, "where", "route")).toMatchObject({
      builtThisWay: true,
      label: "Een route in dezelfde applicatie",
    });
    expect(assessChoice(task, "where", "browser")?.builtThisWay).toBe(false);
    expect(assessChoice(task, "where", "nee")).toBeNull();
    expect(assessChoice(task, "nee", "route")).toBeNull();
  });
});
