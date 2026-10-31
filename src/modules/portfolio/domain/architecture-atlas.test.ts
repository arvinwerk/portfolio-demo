import { describe, expect, it } from "vitest";
import { architectureAtlas, knownScenario, presentAtlas } from "./architecture-atlas";

describe("architectureAtlas", () => {
  const atlas = architectureAtlas();

  it("houdt elk onderdeel op een eigen plek en elke relatie op bekende uiteinden", () => {
    expect(atlas.nodes).toHaveLength(8);
    expect(atlas.scenarios.map((scenario) => scenario.id)).toEqual([
      "keyword-selection",
      "visitor-question",
      "dependency-rule",
      "scalable-assistant",
    ]);
  });

  it("dimt wat buiten het gekozen scenario valt en toont de bijbehorende afweging", () => {
    const view = presentAtlas(atlas, "dependency-rule", "domain");
    expect(view.scenario?.title).toBe("De lagen wijzen naar binnen");
    expect(view.nodes.find((node) => node.id === "domain")).toMatchObject({ dimmed: false, selected: true });
    expect(view.nodes.find((node) => node.id === "composition")?.dimmed).toBe(true);
    expect(view.relations.find((relation) => relation.id === "interface-infrastructure")?.dimmed).toBe(false);
    expect(view.tradeOffs.map((item) => item.id)).toEqual(["two-contexts", "modular-monolith"]);
    expect(view.selected?.excerpt).toContain("interface → application → domain");
  });

  it("negeert een onbekend scenario en kiest anders het eerste onderdeel", () => {
    const view = presentAtlas(atlas, "onzin", null);
    expect(view.scenario).toBeNull();
    expect(view.selected?.id).toBe("composition");
    expect(view.tradeOffs).toEqual([]);
    expect(knownScenario("visitor-question")).toBe("visitor-question");
    expect(knownScenario(["nee"])).toBeNull();
  });
});
