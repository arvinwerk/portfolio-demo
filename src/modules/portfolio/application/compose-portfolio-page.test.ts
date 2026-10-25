import { describe, expect, it } from "vitest";
import { assemblePortfolio } from "../domain/portfolio";
import type { PersonalProfile, ProjectDraft, Skill, Banner } from "../domain/model";
import { composePortfolioPage } from "./compose-portfolio-page";

const profile: PersonalProfile = {
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
};

const skills: Skill[] = [{ name: "React", percentage: 80, category: "framework" }];

const projects: ProjectDraft[] = [
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
];

const banners: Banner[] = [
  {
    title: "Campagne",
    bgImage: { src: "/images/banners/vval-bg.svg" },
    laptopImage: { src: "/images/banners/vval-laptop.svg" },
    mobileImage: { src: "/images/banners/vval-mobile.svg" },
  },
];

const now = new Date(2026, 9, 23);

function page(keywords?: string[]) {
  return composePortfolioPage(assemblePortfolio({ profile, skills, projects, banners }), { now, keywords });
}

describe("composePortfolioPage", () => {
  it("vult leeftijd en jaren in en splitst de github-tekst", () => {
    const model = page();
    expect(model.yearsAsDeveloper).toBe(10);
    expect(model.forewordParagraphs).toEqual(["Leeftijd 32. Jaren 10."]);
    expect(model.githubParagraphs).toEqual(["Eerste alinea.", "Tweede alinea."]);
    expect(model.selectedKeywords).toEqual([]);
    expect(model.projects.map((project) => project.id)).toEqual([1, 2]);
  });

  it("filtert op bekende trefwoorden en negeert onbekende", () => {
    const model = page(["React", "Onzin"]);
    expect(model.projects.map((project) => project.title)).toEqual(["Twee"]);
    expect(model.selectedKeywords).toEqual(["React"]);
  });

  it("weigert een datum in de toekomst", () => {
    expect(() =>
      composePortfolioPage(assemblePortfolio({ profile, skills, projects, banners }), {
        now: new Date(1990, 0, 1),
      }),
    ).toThrow(/toekomst/);
  });
});
