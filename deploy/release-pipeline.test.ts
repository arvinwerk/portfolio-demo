// @vitest-environment node

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflows = path.join(process.cwd(), ".github", "workflows");

function workflow(name: string): string {
  return readFileSync(path.join(workflows, name), "utf8");
}

describe("release pipeline", () => {
  it.each(["deploy.yml", "development.yml"])("%s publiceert pas als unit en playwright groen zijn", (name) => {
    const source = workflow(name);
    expect(source).toContain("uses: ./.github/workflows/unit.yml");
    expect(source).toContain("uses: ./.github/workflows/playwright.yml");
    expect(source).toMatch(/needs:\s*\[unit, playwright\]/);
    expect(source).toContain("needs.unit.result == 'success'");
    expect(source).toContain("needs.playwright.result == 'success'");
  });

  it("laat de suites zelf de testcommando's draaien", () => {
    expect(workflow("unit.yml")).toContain("pnpm test");
    expect(workflow("unit.yml")).not.toContain("pnpm test:e2e");
    expect(workflow("playwright.yml")).toContain("pnpm test:e2e");
    const ci = workflow("ci.yml");
    expect(ci).toContain("uses: ./.github/workflows/unit.yml");
    expect(ci).toContain("uses: ./.github/workflows/playwright.yml");
  });
});
