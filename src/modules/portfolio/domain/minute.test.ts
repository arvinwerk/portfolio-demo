import { describe, expect, it } from "vitest";
import { minuteCopy, minuteNeighbour, minuteTradeOff, parseMinute, proofProject } from "./minute";

describe("parseMinute", () => {
  it("herkent een stap en laat onbekende invoer vallen", () => {
    expect(parseMinute("bewijs")).toBe("bewijs");
    expect(parseMinute(["deur"])).toBe("deur");
    expect(parseMinute("ergens")).toBeNull();
    expect(parseMinute(undefined)).toBeNull();
  });
});

describe("minuteNeighbour", () => {
  it("stapt vooruit en stopt aan de rand", () => {
    expect(minuteNeighbour("wie", 1)).toBe("bewijs");
    expect(minuteNeighbour("deur", 1)).toBeNull();
    expect(minuteNeighbour("wie", -1)).toBeNull();
    expect(minuteNeighbour("oordeel", -1)).toBe("bewijs");
  });
});

const voice = {
  who: "${years} jaar interfaces. ${projects} ${projectWord} op deze pagina. De persoon is verzonnen, de grens niet.",
  door: "De deur noemt ${projects} ${projectWord}.",
};

describe("minuteCopy", () => {
  it("vult de persoonlijke zin en houdt de uitleg van de pagina", () => {
    expect(minuteCopy("wie", { years: 10, projects: 1 }, voice).line).toContain("10 jaar");
    expect(minuteCopy("wie", { years: 10, projects: 1 }, voice).line).toContain("1 project");
    expect(minuteCopy("wie", { years: 10, projects: 2 }, voice).line).toContain("2 projecten");
    expect(minuteCopy("deur", { years: 10, projects: 2 }, voice).line).toBe("De deur noemt 2 projecten.");
    expect(minuteCopy("bewijs", { years: 10, projects: 2 }, voice).line).toContain("meeste trefwoorden");
  });
});

describe("proofProject", () => {
  it("kiest het project met de meeste trefwoorden, React telt extra", () => {
    const chosen = proofProject([
      { title: "A", keywords: ["Angular", "Laravel"] },
      { title: "B", keywords: ["React", "TypeScript", "Next.js"] },
      { title: "C", keywords: ["React", "Next.js"] },
    ]);
    expect(chosen?.title).toBe("B");
    expect(proofProject([])).toBeNull();
  });
});

describe("minuteTradeOff", () => {
  it("legt de vaste vorm van een gidsantwoord uit", () => {
    expect(minuteTradeOff().id).toBe("structured-guidance");
  });
});
