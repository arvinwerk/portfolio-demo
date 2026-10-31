import { describe, expect, it } from "vitest";
import { demonstrateSeal, demonstrationMatches, SEAL_SAMPLE_TEXT } from "./seal-demonstration";

describe("demonstrateSeal", () => {
  it("klopt voor dezelfde tekst en breekt zodra de tekst wijzigt", async () => {
    const signature = await demonstrateSeal(SEAL_SAMPLE_TEXT);
    expect(await demonstrationMatches(SEAL_SAMPLE_TEXT, signature)).toBe(true);
    expect(await demonstrationMatches(`${SEAL_SAMPLE_TEXT} extra`, signature)).toBe(false);
    expect(await demonstrateSeal(SEAL_SAMPLE_TEXT)).toBe(signature);
  });
});
