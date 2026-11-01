import { mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ContentDirectoryError, contentDirectory, readContentDocument } from "./content-directory";

describe("contentDirectory", () => {
  it("valt terug op content/ in de checkout", () => {
    expect(contentDirectory({})).toBe(path.join(process.cwd(), "content"));
  });

  it("leest een absolute map en weigert een relatief pad", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "portfolio-content-"));
    expect(contentDirectory({ CONTENT_DIR: directory })).toBe(directory);
    expect(() => contentDirectory({ CONTENT_DIR: "content" })).toThrow(ContentDirectoryError);
    expect(() => contentDirectory({ CONTENT_DIR: path.join(directory, "ontbreekt") })).toThrow(ContentDirectoryError);

    const file = path.join(directory, "geen-map");
    writeFileSync(file, "x");
    expect(() => contentDirectory({ CONTENT_DIR: file })).toThrow(ContentDirectoryError);
  });

  it("leest een bestand in de map en weigert een symlink naar buiten", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "portfolio-content-"));
    const outside = mkdtempSync(path.join(tmpdir(), "portfolio-outside-"));
    writeFileSync(path.join(directory, "personal.json"), "{\"ok\":true}");
    writeFileSync(path.join(outside, "geheim.json"), "{\"secret\":true}");
    symlinkSync(path.join(outside, "geheim.json"), path.join(directory, "skills.json"));

    expect(readContentDocument(directory, "personal.json")).toBe("{\"ok\":true}");
    expect(() => readContentDocument(directory, "skills.json")).toThrow(ContentDirectoryError);
    expect(() => readContentDocument(directory, "../geheim.json")).toThrow(ContentDirectoryError);
  });
});
