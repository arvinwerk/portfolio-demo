import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { composePortfolioPage } from "../application/compose-portfolio-page";
import { JsonPortfolioRepository } from "./json-portfolio-repository";

describe("JsonPortfolioRepository", () => {
  const portfolio = new JsonPortfolioRepository().load();

  it("leest het gepubliceerde profiel en de twee campagnes", () => {
    expect(portfolio.profile).toMatchObject({
      fullName: "Arvin Sokarijo",
      function: "Senior Angular developer",
      email: "arvin.werk@gmail.com",
      education: null,
      location: "Oranjewoud, in de buurt van Heerenveen",
      linkedIn: "https://www.linkedin.com/in/arvin-sokarijo-7a382011",
      github: "https://github.com/arvinwerk",
      portfolioUrl: "https://arvinportfolio.nl",
    });
    expect(portfolio.profile.foreword).not.toContain("${age}");
    expect(portfolio.profile.foreword).toContain("${yearsAsDeveloper}");
    const profile = readFileSync(path.join(process.cwd(), "content/rag/profile.txt"), "utf8");
    expect(profile).toContain("Arvin Sokarijo");
    expect(profile).toContain("Oranjewoud");
    expect(portfolio.banners.map((banner) => banner.title)).toEqual([
      "Vrienden van Amstel VIP Arrangementen 2024",
      "Heineken Formule 1 VIP",
    ]);
  });

  it("bouwt op 23 oktober 2026 een voorwoord met 17 jaar ontwikkeling", () => {
    const model = composePortfolioPage(portfolio, { now: new Date(2026, 9, 23) });
    expect(model.forewordParagraphs.join(" ")).toContain("17");
    expect(model.projects.map((project) => project.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(model.skillGroups.map((group) => group.label)).toEqual(["Talen", "Frameworks", "Aanpak", "AI"]);
  });

  it("wijst alleen naar beelden die in de contentmap staan", () => {
    const root = process.cwd();
    expect(existsSync(path.join(root, "content/images/profile.svg"))).toBe(true);

    for (const banner of portfolio.banners) {
      for (const image of [banner.bgImage.src, banner.laptopImage.src, banner.mobileImage.src]) {
        const relative = image.replace(/^\//, "");
        expect(existsSync(path.join(root, "content", relative)), image).toBe(true);
      }
    }

    for (const project of portfolio.projects) {
      for (const image of project.images) {
        expect(existsSync(path.join(root, "content/images/logos", image)), image).toBe(true);
      }
    }
  });
});
