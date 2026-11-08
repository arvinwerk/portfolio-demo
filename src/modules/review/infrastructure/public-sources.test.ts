import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { loadReviewExcerpts } from "./public-sources";

describe("loadReviewExcerpts", () => {
  it("leest de afgesproken bestanden en slaat een sleutel en een env-bestand over", () => {
    const root = mkdtempSync(path.join(tmpdir(), "portfolio-sources-"));
    writeTree(root, "src/app/page.tsx", "export default function Home() { return null }\nAI_API_KEY=supersecret\n");
    writeTree(root, "content/personal.json", "{\n  \"fullName\": \"Noor Linden\"\n}\n");
    writeTree(root, ".env", "AI_API_KEY=uit-het-env-bestand\n");
    writeTree(root, "src/modules/review/secret.ts", "export const key = 'niet-in-de-catalogus'\n");

    const excerpts = loadReviewExcerpts(root);
    const page = excerpts.find((excerpt) => excerpt.label === "src/app/page.tsx");
    const personal = excerpts.find((excerpt) => excerpt.label === "content/personal.json");

    expect(page?.audience).toBe("shared");
    expect(page?.text).toContain("Home");
    expect(page?.text).not.toContain("supersecret");
    expect(personal?.text).toContain("Noor Linden");
    expect(excerpts.some((excerpt) => excerpt.label === ".env" || excerpt.text.includes("uit-het-env-bestand"))).toBe(false);
    expect(excerpts.some((excerpt) => excerpt.text.includes("niet-in-de-catalogus"))).toBe(false);
  });
});

function writeTree(root: string, relative: string, text: string): void {
  const full = path.join(root, relative);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, text);
}
