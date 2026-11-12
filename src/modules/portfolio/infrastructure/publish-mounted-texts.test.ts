import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { publishMountedTexts } from "./publish-mounted-texts";

describe("publishMountedTexts", () => {
  it("zet de teksten in CONTENT_DIR en laat een gesprek staan", () => {
    const root = mkdtempSync(path.join(tmpdir(), "portfolio-texts-"));
    const destination = path.join(root, "data");
    mkdirSync(path.join(destination, "chat"), { recursive: true });
    mkdirSync(path.join(destination, "rag"), { recursive: true });
    writeFileSync(path.join(destination, "chat", "gesprek.txt"), "bewaard");
    writeFileSync(path.join(destination, "rag", "oud.txt"), "blijft");
    mkdirSync(path.join(root, "content", "rag"), { recursive: true });
    writeFileSync(path.join(root, "content", ".publish"), "");
    writeFileSync(path.join(root, "content", "personal.json"), "{\"location\":\"Oranjewoud\"}\n");
    writeFileSync(path.join(root, "content", "projects.json"), "[]\n");
    writeFileSync(path.join(root, "content", "skills.json"), "[]\n");
    writeFileSync(path.join(root, "content", "banners.json"), "[]\n");
    writeFileSync(path.join(root, "content", "rag", "profile.txt"), "woont in Oranjewoud\n");

    publishMountedTexts(root, { CONTENT_DIR: destination });
    publishMountedTexts(root, { CONTENT_DIR: destination });

    expect(readFileSync(path.join(destination, "personal.json"), "utf8")).toContain("Oranjewoud");
    expect(readFileSync(path.join(destination, "rag", "profile.txt"), "utf8")).toContain("Oranjewoud");
    expect(readFileSync(path.join(destination, "rag", "oud.txt"), "utf8")).toBe("blijft");
    expect(readFileSync(path.join(destination, "chat", "gesprek.txt"), "utf8")).toBe("bewaard");
    expect(existsSync(path.join(root, "content", ".publish"))).toBe(false);
  });

  it("doet niets zonder het plaatsingsbestand", () => {
    const root = mkdtempSync(path.join(tmpdir(), "portfolio-texts-skip-"));
    const destination = path.join(root, "data");

    publishMountedTexts(root, { CONTENT_DIR: destination });

    expect(existsSync(destination)).toBe(false);
  });
});
