import { describe, expect, it } from "vitest";
import { isReviewLens, lensQuestion, lensTitle, reviewLenses } from "./lens";

describe("isReviewLens", () => {
  it("herkent de drie lenzen en wijst een andere naam af", () => {
    expect(reviewLenses.filter(isReviewLens)).toEqual([...reviewLenses]);
    expect(isReviewLens("geheim")).toBe(false);
    expect(isReviewLens("")).toBe(false);
  });

  it("geeft elke lens een titel en een vraag", () => {
    expect(lensTitle.interface).toBe("UI en gebruik");
    expect(lensTitle.content).toBe("Content");
    expect(lensTitle.findability).toBe("Vindbaarheid");
    for (const lens of reviewLenses) {
      expect(lensQuestion[lens].length).toBeGreaterThan(0);
    }
  });
});
