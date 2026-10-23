import { describe, expect, it } from "vitest";
import { indexMarkdown, searchChunks } from "./markdown-index";

const profile = `<!-- niet indexeren -->
# Profiel

Korte introductie.

## Werk

Interfaces voor Voorbeeld BV.

## Opleiding

Informatica aan de Voorbeeld Hogeschool.
`;

describe("markdown-index", () => {
  const chunks = indexMarkdown(profile);

  it("splitst op koppen en slaat de placeholdercommentaar over", () => {
    expect(chunks.map((chunk) => chunk.heading)).toEqual(["Profiel", "Werk", "Opleiding"]);
    expect(chunks.some((chunk) => chunk.text.includes("niet indexeren"))).toBe(false);
  });

  it("haalt het stuk op dat bij de zoekwoorden hoort", () => {
    expect(searchChunks(chunks, "welke opleiding").map((chunk) => chunk.heading)).toEqual(["Opleiding"]);
    expect(searchChunks(chunks, "bitcoin")).toEqual([]);
  });
});
