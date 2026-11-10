// @vitest-environment node

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("review-daily.timer", () => {
  it("zet 07:00 Amsterdam in de kalenderregel", () => {
    const text = readFileSync(path.join(process.cwd(), "deploy", "review-daily.timer"), "utf8");
    expect(text).toContain("OnCalendar=*-*-* 07:00:00 Europe/Amsterdam");
    expect(text.includes("\nTimezone=")).toBe(false);
  });
});
