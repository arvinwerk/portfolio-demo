import { readFileSync } from "node:fs";
import path from "node:path";
import { differenceInYears, parseCalendarDate } from "../../src/modules/portfolio/domain/calendar-date";
import type { Banner, PersonalProfile, ProjectDraft, Skill } from "../../src/modules/portfolio/domain/model";

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(process.cwd(), "content", name), "utf8")) as T;
}

const personal = readJson<PersonalProfile>("personal.json");
const now = new Date();
const bornOn = personal.dateOfBirth;

export const portfolio = {
  personal,
  skills: readJson<Skill[]>("skills.json"),
  projects: readJson<ProjectDraft[]>("projects.json"),
  banners: readJson<Banner[]>("banners.json"),
  age: bornOn == null ? null : differenceInYears(now, parseCalendarDate(bornOn)),
  yearsAsDeveloper: differenceInYears(now, parseCalendarDate(personal.developingStartDate)),
};

export const ORIGIN = "http://127.0.0.1:3000";

export function pageUrl(pathAndQuery: string): string {
  return new URL(pathAndQuery, ORIGIN).href;
}
