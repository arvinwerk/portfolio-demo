import { describe, expect, it } from "vitest";
import { differenceInYears, parseCalendarDate } from "./dates";

describe("parseCalendarDate", () => {
  it("leest een kalenderdatum in de lokale tijdzone", () => {
    const date = parseCalendarDate("1993-04-18");
    expect(date.getFullYear()).toBe(1993);
    expect(date.getMonth()).toBe(3);
    expect(date.getDate()).toBe(18);
  });

  it.each(["20-06-1994", "1994/06/20", "1994-02-29", "1994-13-01", ""])(
    "wijst %s af",
    (value) => {
      expect(() => parseCalendarDate(value)).toThrow(/Ongeldige datum/);
    },
  );

  it("accepteert 29 februari in een schrikkeljaar", () => {
    expect(parseCalendarDate("2000-02-29").getDate()).toBe(29);
  });
});

describe("differenceInYears", () => {
  const birth = parseCalendarDate("1993-04-18");

  it("telt pas een jaar op de verjaardag", () => {
    expect(differenceInYears(parseCalendarDate("2026-04-17"), birth)).toBe(32);
    expect(differenceInYears(parseCalendarDate("2026-04-18"), birth)).toBe(33);
  });

  it("houdt 29 februari aan als de dag nog niet geweest is", () => {
    const leapBirth = parseCalendarDate("2000-02-29");
    expect(differenceInYears(parseCalendarDate("2023-02-28"), leapBirth)).toBe(22);
    expect(differenceInYears(parseCalendarDate("2023-03-01"), leapBirth)).toBe(23);
  });
});
