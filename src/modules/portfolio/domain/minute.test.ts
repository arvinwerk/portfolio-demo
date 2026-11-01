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

describe("minuteCopy", () => {
  it("noemt de echte aantallen", () => {
    expect(minuteCopy("wie", { years: 10, projects: 1 }).line).toContain("10 jaar");
    expect(minuteCopy("wie", { years: 10, projects: 1 }).line).toContain("1 project");
    expect(minuteCopy("wie", { years: 10, projects: 2 }).line).toContain("2 projecten");
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
