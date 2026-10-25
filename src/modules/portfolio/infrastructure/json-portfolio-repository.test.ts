import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { composePortfolioPage } from "../application/compose-portfolio-page";
import { JsonPortfolioRepository } from "./json-portfolio-repository";

describe("JsonPortfolioRepository", () => {
  const portfolio = new JsonPortfolioRepository().load();

  it("houdt de placeholders en de twee campagnes uit de oude banners", () => {
    expect(portfolio.profile).toMatchObject({
      fullName: "[Naam]",
      function: "[Functie]",
      email: "naam@example.com",
      education: "[Opleiding]",
      location: "[Locatie]",
      linkedIn: "https://example.com/linkedin",
      github: "https://example.com/github",
      portfolioUrl: "https://example.com",
    });
    expect(portfolio.profile.foreword).toContain("${age}");
    expect(portfolio.profile.foreword).toContain("${yearsAsDeveloper}");
    const profile = readFileSync(path.join(process.cwd(), "content/rag/profile.txt"), "utf8");
    expect(profile).toContain("[Naam]");
    expect(profile).toContain("https://example.com/linkedin");
    expect(portfolio.banners.map((banner) => banner.title)).toEqual([
      "Vrienden van Amstel VIP Arrangementen 2024",
      "Heineken Formule 1 VIP",
    ]);
  });

  it("bouwt op 23 oktober 2026 een voorwoord met leeftijd 32 en 10 jaar ontwikkeling", () => {
    const model = composePortfolioPage(portfolio, { now: new Date(2026, 9, 23) });
    expect(model.forewordParagraphs.join(" ")).toContain("32");
    expect(model.forewordParagraphs.join(" ")).toContain("10");
    expect(model.projects.map((project) => project.id)).toEqual([1, 2, 3, 4]);
    expect(model.skillGroups.map((group) => group.label)).toEqual(["Professional", "Frameworks", "Other"]);
  });

  it("wijst alleen naar beelden die in public staan", () => {
    const root = process.cwd();
    expect(existsSync(path.join(root, "public/images/profile.svg"))).toBe(true);

    for (const banner of portfolio.banners) {
      for (const image of [banner.bgImage.src, banner.laptopImage.src, banner.mobileImage.src]) {
        const relative = image.replace(/^\//, "");
        expect(existsSync(path.join(root, "public", relative)), image).toBe(true);
      }
    }

    for (const project of portfolio.projects) {
      for (const image of project.images) {
        expect(existsSync(path.join(root, "public/images/logos", image)), image).toBe(true);
      }
    }
  });
});
