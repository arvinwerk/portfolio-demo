import { describe, expect, it } from "vitest";
import { buildPageModel } from "./page-model";
import type { Content } from "./types";

const content: Content = {
  personal: {
    fullName: "[Naam]",
    function: "[Functie]",
    email: "naam@example.com",
    education: "[Opleiding]",
    developingStartDate: "2016-01-15",
    linkedIn: "https://example.com/linkedin",
    portfolioUrl: "https://example.com",
    location: "[Locatie]",
    foreword: "Leeftijd ${age}. Jaren ${yearsAsDeveloper}.",
    dateOfBirth: "1994-06-20",
    github: "https://example.com/github",
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
      bgImage: { src: "/images/banners/vval-bg.svg" },
      laptopImage: { src: "/images/banners/vval-laptop.svg" },
      mobileImage: { src: "/images/banners/vval-mobile.svg" },
    },
  ],
};

const now = new Date(2026, 9, 23);

describe("buildPageModel", () => {
  it("vult leeftijd en jaren in en splitst de github-tekst", () => {
    const model = buildPageModel(content, { now });
    expect(model.yearsAsDeveloper).toBe(10);
    expect(model.forewordParagraphs).toEqual(["Leeftijd 32. Jaren 10."]);
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
