import { describe, expect, it } from "vitest";
import { displayUrl, paragraphs, renderForeword } from "./text";

describe("paragraphs", () => {
  it("splitst op een lege regel en laat lege stukken weg", () => {
    expect(paragraphs("Eerste.\n\n  Tweede. \n\n")).toEqual(["Eerste.", "Tweede."]);
  });
});

describe("displayUrl", () => {
  it("toont host en pad zonder protocol", () => {
    expect(displayUrl("https://example.com/werk/")).toBe("example.com/werk");
    expect(displayUrl("https://example.com")).toBe("example.com");
  });

  it("geeft ongeldige tekst ongewijzigd terug", () => {
    expect(displayUrl("geen-url")).toBe("geen-url");
  });
});

describe("renderForeword", () => {
  it("vervangt leeftijd en jaren, ook als de placeholder vaker staat", () => {
    const result = renderForeword("Ik ben ${age} en ${age}. Jaren: ${yearsAsDeveloper}.", 32, 10);
    expect(result).toBe("Ik ben 32 en 32. Jaren: 10.");
  });
});
