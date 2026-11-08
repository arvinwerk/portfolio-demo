import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { answerRecruiter } from "../domain/recruiter-answer";
import { parseRecruiterSheet, RecruiterSheetError } from "./recruiter-sheet";

const sheet = `naam: Noor Linden
rol: frontend developer
woonplaats: Kadewijk
opleiding: informatica aan de Voorbeeld Hogeschool, afgerond in 2015
geboren: 1993-04-18
interfaces-sinds: 2015-08-03
nu: sinds 2023 onder de naam Atelier Linden
vaardigheid: Angular
vaardigheid: Laravel
project: Circuit Meridiaan | Baan VIP | Angular, Laravel
contact: noor.linden@example.com
github: example.com/demo/noor-linden
`;

describe("parseRecruiterSheet", () => {
  it("leest het blad uit de checkout en beantwoordt daarmee", () => {
    const facts = parseRecruiterSheet(readFileSync(path.join(process.cwd(), "content/rag/recruiter.txt"), "utf8"));
    expect(answerRecruiter(facts, "Noem een project met Angular en Laravel.", new Date(2026, 10, 8))).toBe(
      "Circuit Meridiaan, Baan VIP. Daar gebruikte ik Angular en Laravel.",
    );
  });

  it("weigert een onvolledig blad", () => {
    expect(() => parseRecruiterSheet(sheet.replace("geboren: 1993-04-18\n", ""))).toThrow(RecruiterSheetError);
    expect(() => parseRecruiterSheet(sheet.replace("1993-04-18", "1993-13-40"))).toThrow(RecruiterSheetError);
    expect(() => parseRecruiterSheet(`${sheet}project: Alleen een naam\n`)).toThrow(RecruiterSheetError);
    expect(() => parseRecruiterSheet(`${sheet}onbekend: iets\n`)).toThrow(RecruiterSheetError);
  });

  it("slaat commentaar en lege regels over", () => {
    const facts = parseRecruiterSheet(`# demo\n\n${sheet}`);
    expect(facts.name).toBe("Noor Linden");
    expect(facts.skills).toEqual(["Angular", "Laravel"]);
  });
});
