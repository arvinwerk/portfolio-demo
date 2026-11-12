import { parseIsoDate } from "../domain/iso-date";
import type { RecruiterFacts, RecruiterProject } from "../domain/recruiter-facts";

export class RecruiterSheetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecruiterSheetError";
  }
}

const SINGLE_KEYS = ["naam", "rol", "woonplaats", "interfaces-sinds", "nu", "contact", "github"] as const;

const OPTIONAL_KEYS = ["opleiding", "geboren"] as const;

type SingleKey = (typeof SINGLE_KEYS)[number];
type OptionalKey = (typeof OPTIONAL_KEYS)[number];
type SheetKey = SingleKey | OptionalKey;

export function parseRecruiterSheet(text: string): RecruiterFacts {
  const singles = new Map<SheetKey, string>();
  const skills: string[] = [];
  const projects: RecruiterProject[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const splitAt = line.indexOf(":");
    if (splitAt <= 0) {
      throw new RecruiterSheetError("Een regel in het recruiterblad mist een sleutel.");
    }

    const key = line.slice(0, splitAt).trim().toLowerCase();
    const value = line.slice(splitAt + 1).trim();
    if (value.length === 0) {
      throw new RecruiterSheetError("Een regel in het recruiterblad is leeg.");
    }

    if (key === "vaardigheid") {
      skills.push(value);
      continue;
    }
    if (key === "project") {
      projects.push(parseProject(value));
      continue;
    }
    if (!isSingleKey(key) && !isOptionalKey(key)) {
      throw new RecruiterSheetError("Het recruiterblad bevat een onbekende sleutel.");
    }
    if (singles.has(key)) {
      throw new RecruiterSheetError("Het recruiterblad herhaalt een sleutel.");
    }
    singles.set(key, value);
  }

  for (const key of SINGLE_KEYS) {
    if (!singles.has(key)) {
      throw new RecruiterSheetError("Het recruiterblad mist een verplicht veld.");
    }
  }
  if (skills.length === 0 || projects.length === 0) {
    throw new RecruiterSheetError("Het recruiterblad mist vaardigheden of projecten.");
  }

  return {
    name: required(singles, "naam"),
    role: required(singles, "rol"),
    residence: required(singles, "woonplaats"),
    education: singles.get("opleiding") ?? null,
    bornOn: calendarDateOrNull(singles.get("geboren")),
    interfacesSince: calendarDate(required(singles, "interfaces-sinds")),
    currentWork: required(singles, "nu"),
    skills,
    projects,
    contact: required(singles, "contact"),
    github: required(singles, "github"),
  };
}

function parseProject(value: string): RecruiterProject {
  const parts = value.split("|").map((part) => part.trim());
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    throw new RecruiterSheetError("Een projectregel in het recruiterblad is onvolledig.");
  }

  const stack = parts[2].split(",").map((item) => item.trim()).filter((item) => item.length > 0);
  if (stack.length === 0) {
    throw new RecruiterSheetError("Een projectregel in het recruiterblad mist een stack.");
  }

  return { client: parts[0], title: parts[1], stack };
}

function calendarDateOrNull(value: string | undefined): Date | null {
  return value == null ? null : calendarDate(value);
}

function calendarDate(value: string): Date {
  try {
    return parseIsoDate(value);
  } catch {
    throw new RecruiterSheetError("Een datum in het recruiterblad is ongeldig.");
  }
}

function required(singles: Map<SheetKey, string>, key: SingleKey): string {
  return singles.get(key) ?? "";
}

function isSingleKey(key: string): key is SingleKey {
  return (SINGLE_KEYS as readonly string[]).includes(key);
}

function isOptionalKey(key: string): key is OptionalKey {
  return (OPTIONAL_KEYS as readonly string[]).includes(key);
}
