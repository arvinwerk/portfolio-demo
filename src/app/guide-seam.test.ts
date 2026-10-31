import { describe, expect, it } from "vitest";
import { GUIDANCE_FOCUSES } from "@/modules/assistant";
import { ARCHITECTURE_SCENARIO_IDS } from "@/modules/portfolio";

describe("gids en kaart", () => {
  it("laat elke focus van de gids bestaan als scenario", () => {
    for (const focus of GUIDANCE_FOCUSES) {
      expect(ARCHITECTURE_SCENARIO_IDS).toContain(focus);
    }
  });
});
