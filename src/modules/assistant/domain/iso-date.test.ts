import { describe, expect, it } from "vitest";
import { formatDutchDate, fullYearsBetween, parseIsoDate } from "./iso-date";

describe("parseIsoDate", () => {
  it("leest een kalenderdatum in de lokale tijdzone", () => {
    const date = parseIsoDate("1993-04-18");
    expect(date.getFullYear()).toBe(1993);
    expect(date.getMonth()).toBe(3);
    expect(date.getDate()).toBe(18);
  });

  it.each(["20-06-1994", "1994/06/20", "1994-02-29", "1994-13-01", ""])("wijst %s af", (value) => {
    expect(() => parseIsoDate(value)).toThrow(/Ongeldige datum/);
  });

  it("accepteert 29 februari in een schrikkeljaar", () => {
    expect(parseIsoDate("2000-02-29").getDate()).toBe(29);
  });
});

describe("fullYearsBetween", () => {
  const birth = parseIsoDate("1993-04-18");

  it("telt pas een jaar op de verjaardag", () => {
    expect(fullYearsBetween(parseIsoDate("2026-04-17"), birth)).toBe(32);
    expect(fullYearsBetween(parseIsoDate("2026-04-18"), birth)).toBe(33);
  });

  it("zakt niet onder nul", () => {
    expect(fullYearsBetween(parseIsoDate("1990-01-01"), parseIsoDate("2000-01-01"))).toBe(0);
  });
});

describe("formatDutchDate", () => {
  it("schrijft de maand in het Nederlands", () => {
    expect(formatDutchDate(parseIsoDate("2015-08-03"))).toBe("3 augustus 2015");
    expect(formatDutchDate(parseIsoDate("2026-12-09"))).toBe("9 december 2026");
  });
});
