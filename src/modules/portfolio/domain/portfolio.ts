import { differenceInYears, parseCalendarDate } from "./calendar-date";
import type { Banner, PersonalProfile, Project, ProjectDraft, Skill } from "./model";
import { assignProjectIds } from "./projects";

export type Portfolio = {
  profile: PersonalProfile;
  skills: Skill[];
  projects: Project[];
  banners: Banner[];
};

export function assemblePortfolio(parts: {
  profile: PersonalProfile;
  skills: Skill[];
  projects: ProjectDraft[];
  banners: Banner[];
}): Portfolio {
  return {
    profile: parts.profile,
    skills: parts.skills,
    projects: assignProjectIds(parts.projects),
    banners: parts.banners,
  };
}

export function timelineAt(profile: PersonalProfile, now: Date): { age: number; yearsAsDeveloper: number } {
  const age = differenceInYears(now, parseCalendarDate(profile.dateOfBirth));
  const yearsAsDeveloper = differenceInYears(now, parseCalendarDate(profile.developingStartDate));

  if (age < 0 || yearsAsDeveloper < 0) {
    throw new Error("Geboortedatum of start als developer ligt in de toekomst.");
  }

  return { age, yearsAsDeveloper };
}
