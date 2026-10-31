import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readSiteImage } from "./site-image";

describe("readSiteImage", () => {
  it("leest een beeld uit CONTENT_DIR/images en weigert een pad dat ontsnapt", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "portfolio-images-"));
    const outside = mkdtempSync(path.join(tmpdir(), "portfolio-outside-"));
    writeFileSync(path.join(outside, "geheim.svg"), "<svg>geheim</svg>");
    mkdirSync(path.join(directory, "images", "logos"), { recursive: true });
    writeFileSync(path.join(directory, "images", "logos", "merk.png"), "png");
    symlinkSync(outside, path.join(directory, "images", "ontsnapping"));

    const env = { CONTENT_DIR: directory };
    expect(readSiteImage("logos/merk.png", env)).toEqual({
      bytes: Buffer.from("png"),
      contentType: "image/png",
    });
    expect(readSiteImage("../geheim.svg", env)).toBeUndefined();
    expect(readSiteImage("ontsnapping/geheim.svg", env)).toBeUndefined();
    expect(readSiteImage("logos/merk.exe", env)).toBeUndefined();
  });
});
