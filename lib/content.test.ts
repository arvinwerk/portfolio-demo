import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { loadContent } from "./content";
import { buildPageModel } from "./page-model";

describe("voorbeeldcontent", () => {
  const content = loadContent();

  it("houdt de placeholders en de twee campagnes uit de oude banners", () => {
    expect(content.personal.foreword).toContain("${age}");
    expect(content.personal.foreword).toContain("${yearsAsDeveloper}");
    expect(content.personal.fullName).toBe("Noor Linden");
    expect(content.personal.location).toContain("verzonnen");
    expect(content.banners.map((banner) => banner.title)).toEqual([
      "Festival Noordlicht — Lichtarrangementen",
      "Circuit Meridiaan — Baan VIP",
    ]);
  });

  it("bouwt op 23 oktober 2026 een voorwoord met leeftijd 33 en 11 jaar ontwikkeling", () => {
    const model = buildPageModel(content, { now: new Date(2026, 9, 23) });
    expect(model.forewordParagraphs.join(" ")).toContain("verzonnen");
    expect(model.forewordParagraphs.join(" ")).toContain("33");
    expect(model.forewordParagraphs.join(" ")).toContain("11");
    expect(model.projects.map((project) => project.id)).toEqual([1, 2, 3, 4, 5]);
    expect(model.skillGroups.map((group) => group.label)).toEqual(["Professional", "Frameworks", "Other"]);
  });

  it("wijst alleen naar beelden die in public staan", () => {
    const root = process.cwd();
    expect(existsSync(path.join(root, "public/images/profile.svg"))).toBe(true);

    for (const banner of content.banners) {
      for (const image of [banner.bgImage.src, banner.laptopImage.src, banner.mobileImage.src]) {
        const relative = image.replace(/^\//, "");
        expect(existsSync(path.join(root, "public", relative)), image).toBe(true);
      }
    }

    for (const project of content.projects) {
      for (const image of project.images) {
        expect(existsSync(path.join(root, "public/images/logos", image)), image).toBe(true);
      }
    }
  });
});
