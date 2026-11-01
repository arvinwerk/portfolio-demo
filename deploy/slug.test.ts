// @vitest-environment node

import { describe, expect, it } from "vitest";
import { isSlug, previewSlug } from "./slug.js";

describe("previewSlug", () => {
  it("maakt van een taknaam een DNS-label", () => {
    expect(previewSlug("feature/filter")).toBe("feature-filter");
    expect(previewSlug("refs/heads/Feature/Filter")).toBe("feature-filter");
    expect(previewSlug("feature--filter")).toBe("feature-filter");
    expect(previewSlug("cursor/preview-subdomains-8aff")).toBe("cursor-preview-subdomains-8aff");
  });

  it("weigert de productietak en een lege naam", () => {
    expect(previewSlug("master")).toBeUndefined();
    expect(previewSlug("main")).toBeUndefined();
    expect(previewSlug("refs/heads/master")).toBeUndefined();
    expect(previewSlug("---")).toBeUndefined();
    expect(previewSlug("")).toBeUndefined();
  });

  it("kapt een label af op 63 tekens", () => {
    const slug = previewSlug("a".repeat(80));
    expect(slug).toHaveLength(63);
    expect(slug && isSlug(slug)).toBe(true);
    expect(previewSlug(`${"ab-".repeat(40)}`)).toMatch(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/);
  });
});
