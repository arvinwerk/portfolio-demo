import { describe, expect, it } from "vitest";
import {
  ACQUAINTANCE_QUESTION,
  RECRUITER_PROMPT,
  givenName,
  recruiterQuestion,
  strangerPrompt,
  visitorDoors,
} from "./visitor-door";

describe("visitorDoors", () => {
  const doors = visitorDoors("Noor Linden");

  it("zet de voornaam in de ingang van iemand die de persoon kent", () => {
    expect(givenName("Noor Linden")).toBe("Noor");
    expect(doors.map((door) => door.label)).toEqual(["Ik zoek iemand", "Ik ken Noor", "Ik liep binnen"]);
    expect(doors.map((door) => door.line)).toEqual([
      "Zeg de stack. Ik zeg of die erin zit.",
      "Waar ik nu werk, en wat ik doe.",
      "Eén blik. Dan ken je me.",
    ]);
  });

  it("geeft een recruiter de voorzet en wacht op het antwoord", () => {
    const recruiter = doors[0];
    expect(recruiter?.prompt).toBe(RECRUITER_PROMPT);
    expect(recruiter?.question).toBeUndefined();
  });

  it("vraagt voor een bekende naar het huidige werk", () => {
    expect(doors[1]?.prompt).toContain("waar ik nu werk");
    expect(doors[1]?.question).toBe(ACQUAINTANCE_QUESTION);
  });

  it("geeft een onbekende een eerste indruk zonder vraag aan de server", () => {
    const stranger = doors[2];
    expect(stranger?.prompt).toBe(strangerPrompt("Noor"));
    expect(stranger?.prompt).toContain("verzonnen");
    expect(stranger?.question).toBeUndefined();
  });

  it("maakt van een losse recruiterzin een vaardigheidsvraag", () => {
    expect(recruiterQuestion("Angular en Laravel")).toBe("Kun je ook Angular en Laravel?");
    expect(recruiterQuestion("  TypeScript  ")).toBe("Kun je ook TypeScript?");
    expect(recruiterQuestion("Kun je Vue?")).toBe("Kun je Vue?");
    expect(recruiterQuestion("Wie ben je?")).toBe("Wie ben je?");
  });
});
