import { describe, expect, it } from "vitest";
import type { PersonalProfile } from "./model";
import { timelineAt } from "./portfolio";

const profile: PersonalProfile = {
  fullName: "[Naam]",
  function: "[Functie]",
  email: "naam@example.com",
  education: null,
  developingStartDate: "2009-01-01",
  linkedIn: "https://example.com/linkedin",
  portfolioUrl: "https://example.com",
  location: "Heerenveen",
  foreword: "Ik doe dit ${yearsAsDeveloper} jaar.",
  dateOfBirth: null,
  github: "https://example.com/github",
  githubDescription: "Code",
};

describe("timelineAt", () => {
  it("telt de jaren sinds de start en slaat de leeftijd over zonder geboortedatum", () => {
    expect(timelineAt(profile, new Date(2026, 9, 23))).toEqual({ age: null, yearsAsDeveloper: 17 });
  });
});
