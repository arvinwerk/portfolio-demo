import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { MarkdownReportArchive } from "./markdown-report-archive";

describe("MarkdownReportArchive", () => {
  it("schrijft een markdownbestand en leest een sleutel niet terug", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "portfolio-report-"));
    writeFileSync(path.join(directory, "notes.md"), "niet een rapport");
    writeFileSync(
      path.join(directory, "2026-11-08-interface.md"),
      "Score: 8/10\n- Maak de knop duidelijker\n- sk-ant-api03-abcdefghijklmnopqrstuvwxyz\n",
    );
    const archive = new MarkdownReportArchive(directory);

    const listed = archive.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.score).toBe(8);
    expect(listed[0]?.suggestions[0]).toBe("Maak de knop duidelijker");
    expect(JSON.stringify(listed)).not.toContain("sk-ant-");

    archive.save({
      date: "2026-11-09",
      lens: "findability",
      score: 6,
      suggestions: ["Geef de pagina een beschrijving"],
      body: "De titel is alleen een naam.",
    });

    const markdown = readFileSync(path.join(directory, "2026-11-09-findability.md"), "utf8");
    expect(markdown).toContain("# Vindbaarheid");
    expect(markdown).toContain("6/10");
    expect(markdown).toContain("- Geef de pagina een beschrijving");
    expect(archive.list().map((report) => report.date).toSorted()).toEqual(["2026-11-08", "2026-11-09"]);
  });
});
