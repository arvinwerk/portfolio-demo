import { describe, expect, it } from "vitest";
import { parseIsoDate } from "./iso-date";
import { recruiterBriefing } from "./recruiter-briefing";
import type { RecruiterFacts } from "./recruiter-facts";

const now = new Date(2026, 10, 8);

const facts: RecruiterFacts = {
  name: "Noor Linden",
  role: "frontend developer",
  residence: "Kadewijk",
  education: "informatica aan de Voorbeeld Hogeschool, afgerond in 2015",
  bornOn: parseIsoDate("1993-04-18"),
  interfacesSince: parseIsoDate("2015-08-03"),
  currentWork: "sinds 2023 onder de naam Atelier Linden",
  skills: ["TypeScript", "JavaScript", "Toegankelijkheid", "Angular", "React", "Next.js", "Laravel", "Node.js", "Testen"],
  projects: [
    { client: "Festival Noordlicht", title: "Lichtarrangementen", stack: ["Angular", "TypeScript"] },
    { client: "Circuit Meridiaan", title: "Baan VIP", stack: ["Angular", "Laravel"] },
    { client: "Studio Noord", title: "componentbibliotheek", stack: ["React", "TypeScript", "Next.js"] },
    { client: "Haven & Co", title: "content-API", stack: ["Laravel", "Node.js"] },
    { client: "Atelier Linden", title: "deze demopagina", stack: ["React", "Next.js"] },
  ],
  contact: "noor.linden@example.com",
  github: "example.com/demo/noor-linden",
};

function briefing(at = now): string {
  return recruiterBriefing(facts, at);
}

describe("recruiterBriefing", () => {
  it("geeft het hele blad, met leeftijd en jaren al uitgerekend", () => {
    const text = briefing();
    expect(text).toContain("Naam: Noor Linden");
    expect(text).toContain("Opleiding: informatica aan de Voorbeeld Hogeschool, afgerond in 2015");
    expect(text).toContain("Geboren: 18 april 1993");
    expect(text).toContain("Leeftijd: 33 jaar");
    expect(text).toContain("Interfaces sinds: 3 augustus 2015");
    expect(text).toContain("Jaren interfaces: 11");
    expect(text).toContain("Werk nu: sinds 2023 onder de naam Atelier Linden");
    expect(text).toContain(
      "Vaardigheden: TypeScript, JavaScript, Toegankelijkheid, Angular, React, Next.js, Laravel, Node.js, Testen",
    );
    expect(text).toContain("Festival Noordlicht, Lichtarrangementen. Stack: Angular, TypeScript.");
    expect(text).toContain("Circuit Meridiaan, Baan VIP. Stack: Angular, Laravel.");
    expect(text).toContain("Haven & Co, content-API. Stack: Laravel, Node.js.");
    expect(text).toContain("Contact: noor.linden@example.com");
    expect(text).toContain("GitHub: example.com/demo/noor-linden");
    expect(text).toContain("Niet aanwezig: salaris, tarief, loon, beschikbaarheid, opzegtermijn, ingangsdatum.");
    expect(text).not.toContain("Ja. Angular staat bij de vaardigheden.");
  });

  it("telt een jaar pas na de verjaardag van de startdatum", () => {
    expect(briefing(new Date(2026, 7, 2))).toContain("Jaren interfaces: 10");
    expect(briefing(new Date(2026, 7, 3))).toContain("Jaren interfaces: 11");
    expect(briefing(new Date(2026, 3, 17))).toContain("Leeftijd: 32 jaar");
    expect(briefing(new Date(2026, 3, 18))).toContain("Leeftijd: 33 jaar");
  });
});
