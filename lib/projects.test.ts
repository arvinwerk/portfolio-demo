import { describe, expect, it } from "vitest";
import {
  assignProjectIds,
  collectKeywords,
  effectiveSelection,
  filterProjects,
  keywordLinks,
  keywordsToHref,
  parseKeywords,
  toggleKeyword,
} from "./projects";
import type { ProjectInput } from "./types";

const input: ProjectInput[] = [
  {
    company: "Vrienden van Amstel",
    title: "VIP",
    shortDescription: "Kort",
    longDescription: null,
    keywords: ["Angular", "TypeScript"],
    images: [],
  },
  {
    company: "Heineken",
    title: "GP",
    shortDescription: "Kort",
    longDescription: "Lang",
    keywords: ["Angular", "Laravel"],
    images: [],
  },
  {
    company: "Studio Noord",
    title: "UI",
    shortDescription: "Kort",
    longDescription: null,
    keywords: ["React", "TypeScript"],
    images: [],
  },
];

const projects = assignProjectIds(input);
const catalog = collectKeywords(projects);

describe("assignProjectIds", () => {
  it("geeft id's vanaf 1 in bestandsvolgorde", () => {
    expect(projects.map((project) => project.id)).toEqual([1, 2, 3]);
  });
});

describe("collectKeywords", () => {
  it("houdt de volgorde van eerste voorkomen aan", () => {
    expect(catalog).toEqual(["Angular", "TypeScript", "Laravel", "React"]);
  });
});

describe("parseKeywords", () => {
  it("leest herhaalde parameters en een kommagescheiden waarde", () => {
    expect(parseKeywords(["Angular", "React"])).toEqual(["Angular", "React"]);
    expect(parseKeywords("Angular, React")).toEqual(["Angular", "React"]);
  });

  it("laat lege waarden en dubbelen weg", () => {
    expect(parseKeywords(["", "Angular", "Angular"])).toEqual(["Angular"]);
    expect(parseKeywords(undefined)).toEqual([]);
  });
});

describe("toggleKeyword", () => {
  it("zet een trefwoord aan en uit en bewaart de catalogusvolgorde", () => {
    const selected = toggleKeyword(catalog, [], "React");
    expect(selected).toEqual(["React"]);
    expect(toggleKeyword(catalog, selected, "Angular")).toEqual(["Angular", "React"]);
    expect(toggleKeyword(catalog, ["Angular", "React"], "Angular")).toEqual(["React"]);
  });

  it("negeert een onbekend trefwoord", () => {
    expect(toggleKeyword(catalog, ["Angular", "Onzin"], "Onzin")).toEqual(["Angular"]);
  });
});

describe("filterProjects", () => {
  it("toont alles zonder selectie", () => {
    expect(filterProjects(projects, [])).toHaveLength(3);
  });

  it("houdt een project als één trefwoord overeenkomt", () => {
    expect(filterProjects(projects, ["Angular", "React"]).map((project) => project.id)).toEqual([1, 2, 3]);
    expect(filterProjects(projects, ["Laravel"]).map((project) => project.title)).toEqual(["GP"]);
  });
});

describe("keywordLinks", () => {
  it("maakt een href die de huidige selectie omklapt", () => {
    const links = keywordLinks(catalog, effectiveSelection(catalog, ["Angular"]));
    expect(links.find((link) => link.key === "Angular")).toMatchObject({
      selected: true,
      href: "/#werk",
    });
    expect(links.find((link) => link.key === "React")?.href).toBe(
      keywordsToHref(["Angular", "React"]),
    );
  });
});
