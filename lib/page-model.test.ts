import { describe, expect, it } from "vitest";
import { buildPageModel } from "./page-model";
import type { Content } from "./types";

const content: Content = {
  personal: {
    fullName: "Noor Linden",
    function: "Frontend developer",
    email: "noor.linden@example.com",
    education: "Voorbeeld",
    developingStartDate: "2015-08-03",
    linkedIn: "https://example.com/demo/noor-linden/linkedin",
    portfolioUrl: "https://example.com/demo/noor-linden",
    location: "Kadewijk (verzonnen)",
    foreword: "Leeftijd ${age}. Jaren ${yearsAsDeveloper}.",
    dateOfBirth: "1993-04-18",
    github: "https://example.com/demo/noor-linden/code",
    githubDescription: "Eerste alinea.\n\nTweede alinea.",
  },
  skills: [{ name: "React", percentage: 80, category: "framework" }],
  projects: [
    {
      company: "A",
      title: "Een",
      shortDescription: "Kort",
      longDescription: null,
      keywords: ["Angular"],
      images: [],
    },
    {
      company: "B",
      title: "Twee",
      shortDescription: "Kort",
      longDescription: null,
      keywords: ["React"],
      images: [],
    },
  ],
  banners: [
    {
      title: "Campagne",
      bgImage: { src: "/images/banners/noordlicht-bg.svg" },
      laptopImage: { src: "/images/banners/noordlicht-laptop.svg" },
      mobileImage: { src: "/images/banners/noordlicht-mobile.svg" },
    },
  ],
};

const now = new Date(2026, 9, 23);

describe("buildPageModel", () => {
  it("vult leeftijd en jaren in en splitst de github-tekst", () => {
    const model = buildPageModel(content, { now });
    expect(model.yearsAsDeveloper).toBe(11);
    expect(model.forewordParagraphs).toEqual(["Leeftijd 33. Jaren 11."]);
    expect(model.githubParagraphs).toEqual(["Eerste alinea.", "Tweede alinea."]);
    expect(model.allSelected).toBe(true);
    expect(model.projects.map((project) => project.id)).toEqual([1, 2]);
  });

  it("filtert op bekende trefwoorden uit de query en negeert onbekende", () => {
    const model = buildPageModel(content, { now, keywords: ["React", "Onzin"] });
    expect(model.projects.map((project) => project.title)).toEqual(["Twee"]);
    expect(model.keywordLinks.find((link) => link.key === "React")?.selected).toBe(true);
    expect(model.allSelected).toBe(false);
  });

  it("weigert een datum in de toekomst", () => {
    expect(() =>
      buildPageModel(content, { now: new Date(1990, 0, 1) }),
    ).toThrow(/toekomst/);
  });
});
