import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ReviewDirectoryError, reviewsDirectory } from "./reviews-directory";

describe("reviewsDirectory", () => {
  it("legt rapporten onder content/reviews of onder CONTENT_DIR", () => {
    expect(reviewsDirectory({})).toBe(path.join(process.cwd(), "content", "reviews"));

    const directory = mkdtempSync(path.join(tmpdir(), "portfolio-reviews-"));
    expect(reviewsDirectory({ CONTENT_DIR: directory })).toBe(path.join(directory, "reviews"));
  });

  it("weigert een CONTENT_DIR die geen map is", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "portfolio-reviews-"));
    const file = path.join(directory, "bestand");
    writeFileSync(file, "nee");

    expect(() => reviewsDirectory({ CONTENT_DIR: "content" })).toThrow(ReviewDirectoryError);
    expect(() => reviewsDirectory({ CONTENT_DIR: file })).toThrow(ReviewDirectoryError);
    expect(() => reviewsDirectory({ CONTENT_DIR: path.join(directory, "ontbreekt") })).toThrow(ReviewDirectoryError);
  });
});
