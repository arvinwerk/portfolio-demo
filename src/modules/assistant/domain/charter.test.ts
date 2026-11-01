import { describe, expect, it } from "vitest";
import { assistantCharter } from "./charter";

describe("assistantCharter", () => {
  it("zet de persoonlijke zin tussen de vaste regels", () => {
    const charter = assistantCharter("Deze persoon is echt.");

    expect(charter).toContain("Deze persoon is echt.");
    expect(charter).toContain("Roep searchProfile aan");
    expect(charter).not.toContain("verzonnen");
  });
});
