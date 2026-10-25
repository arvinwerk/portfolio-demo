import { readFileSync } from "node:fs";
import path from "node:path";
import { differenceInYears, parseCalendarDate } from "../../lib/dates";
import type { Banner, Personal, ProjectInput, Skill } from "../../lib/types";

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(process.cwd(), "content", name), "utf8")) as T;
}

const personal = readJson<Personal>("personal.json");
const now = new Date();

export const portfolio = {
  personal,
  skills: readJson<Skill[]>("skills.json"),
  projects: readJson<ProjectInput[]>("projects.json"),
  banners: readJson<Banner[]>("banners.json"),
  age: differenceInYears(now, parseCalendarDate(personal.dateOfBirth)),
  yearsAsDeveloper: differenceInYears(now, parseCalendarDate(personal.developingStartDate)),
};

export const ORIGIN = "http://127.0.0.1:3000";

export function pageUrl(pathAndQuery: string): string {
  return new URL(pathAndQuery, ORIGIN).href;
}
