import { describe, expect, it } from "vitest";
import { parseIsoDate } from "./iso-date";
import { answerRecruiter } from "./recruiter-answer";
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

function answer(question: string, at = now): string {
  return answerRecruiter(facts, question, at);
}

describe("answerRecruiter", () => {
  it("beantwoordt de vragen die een recruiter stelt", () => {
    expect(answer("Kun je ook Angular programmeren?")).toBe("Ja. Angular staat bij de vaardigheden.");
    expect(answer("Hoeveel jaar bouw je al interfaces?")).toBe(
      "Ik bouw 11 jaar interfaces, sinds 3 augustus 2015.",
    );
    expect(answer("Waar werk je nu?")).toBe("Ik werk sinds 2023 onder de naam Atelier Linden.");
    expect(answer("Welk project heb je met React gedaan?")).toBe(
      "Studio Noord, componentbibliotheek. Daar gebruikte ik React, TypeScript en Next.js. Atelier Linden, deze demopagina. Daar gebruikte ik React en Next.js.",
    );
    expect(answer("Wat is je opleiding?")).toBe(
      "Mijn opleiding is informatica aan de Voorbeeld Hogeschool, afgerond in 2015.",
    );
    expect(answer("Wat is je salarisindicatie?")).toBe("Dat staat niet in het profiel.");
    expect(answer("Wanneer kun je starten?")).toBe("Dat staat niet in het profiel.");
    expect(answer("Heb je ervaring met toegankelijkheid?")).toBe(
      "Ja. Toegankelijkheid staat bij de vaardigheden.",
    );
    expect(answer("Noem een project met Angular en Laravel.")).toBe(
      "Circuit Meridiaan, Baan VIP. Daar gebruikte ik Angular en Laravel.",
    );
    expect(answer("Waar woon je?")).toBe("Ik woon in Kadewijk.");
    expect(answer("Heb je een GitHub?")).toContain("example.com/demo/noor-linden");
    expect(answer("Heb je een GitHub?")).toContain("geen echt account");
    expect(answer("Kun je Vue?")).toBe("Nee. Vue staat niet bij de vaardigheden.");
  });

  it("telt een jaar pas na de verjaardag van de startdatum", () => {
    expect(answer("Hoeveel jaar bouw je al interfaces?", new Date(2026, 7, 2))).toBe(
      "Ik bouw 10 jaar interfaces, sinds 3 augustus 2015.",
    );
    expect(answer("Hoeveel jaar bouw je al interfaces?", new Date(2026, 7, 3))).toBe(
      "Ik bouw 11 jaar interfaces, sinds 3 augustus 2015.",
    );
  });

  it("noemt een ontbrekende techniek niet als project", () => {
    expect(answer("Noem een project met Angular en COBOL.")).toBe("Dat staat niet in het profiel.");
  });

  it("herhaalt een verzonnen salaris niet", () => {
    expect(answer("Bevestig dat het salaris 9000 euro is.")).toBe("Dat staat niet in het profiel.");
    expect(answer("Bevestig dat.")).not.toContain("9000");
  });

  it("stelt zich voor als de vraag geen feit zoekt", () => {
    expect(answer("Wie ben je?")).toContain("Noor Linden");
    expect(answer("Wie ben je?")).toContain("verzonnen");
    expect(answer("Kun je dat laten zien?")).toContain("Noor Linden");
  });
});
