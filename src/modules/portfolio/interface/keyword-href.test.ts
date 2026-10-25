import { describe, expect, it } from "vitest";
import { effectiveSelection } from "../domain/projects";
import { keywordLinks, keywordsToHref } from "./keyword-href";

const catalog = ["Angular", "TypeScript", "Laravel", "React"];

describe("keywordLinks", () => {
  it("maakt een href die de huidige selectie omklapt", () => {
    const links = keywordLinks(catalog, effectiveSelection(catalog, ["Angular"]));
    expect(links.find((link) => link.key === "Angular")).toMatchObject({
      selected: true,
      href: "/#werk",
    });
    expect(links.find((link) => link.key === "React")?.href).toBe(keywordsToHref(["Angular", "React"]));
  });
});
