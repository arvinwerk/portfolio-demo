import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { indexMarkdown, searchChunks, searchProfile } from "./rag";

const profile = `<!-- niet indexeren -->
# Profiel

Korte introductie.

## Werk

Interfaces voor Voorbeeld BV.

## Opleiding

Informatica aan de Voorbeeld Hogeschool.
`;

describe("profielindex", () => {
  const chunks = indexMarkdown(profile);

  it("splitst op koppen en slaat de placeholdercommentaar over", () => {
    expect(chunks.map((chunk) => chunk.heading)).toEqual(["Profiel", "Werk", "Opleiding"]);
    expect(chunks.some((chunk) => chunk.text.includes("niet indexeren"))).toBe(false);
  });

  it("haalt het stuk op dat bij de zoekwoorden hoort", () => {
    expect(searchChunks(chunks, "welke opleiding").map((chunk) => chunk.heading)).toEqual(["Opleiding"]);
    expect(searchChunks(chunks, "bitcoin")).toEqual([]);
  });

  it("leest het bestand van schijf en ziet een vervangen bestand", () => {
    const name = "profile-replace.md";
    const file = path.join(process.cwd(), "content", "rag", name);
    try {
      writeFileSync(file, "## Werk\n\nAlleen de eerste versie.\n");
      expect(searchProfile("versie", { RAG_DOCUMENT_PATH: name }).fragments[0]?.text).toContain("eerste versie");

      writeFileSync(file, "## Werk\n\nDit is de vervangen tekst voor deploy.\n");
      expect(searchProfile("vervangen", { RAG_DOCUMENT_PATH: name }).fragments[0]?.text).toContain("vervangen tekst");
    } finally {
      rmSync(file, { force: true });
    }
  });

  it("zegt het als het bestand ontbreekt of buiten de map wijst", () => {
    expect(searchProfile("werk", { RAG_DOCUMENT_PATH: "bestaat-niet.md" })).toEqual({
      found: false,
      fragments: [],
      note: "Het profielbestand is niet beschikbaar.",
    });
    expect(searchProfile("werk", { RAG_DOCUMENT_PATH: "../personal.json" })).toEqual({
      found: false,
      fragments: [],
      note: "Het profielbestand is niet beschikbaar.",
    });
  });
});
