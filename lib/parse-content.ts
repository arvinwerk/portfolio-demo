import { parseCalendarDate } from "./dates";
import { SKILL_CATEGORIES, type Banner, type Content, type Personal, type ProjectInput, type Skill } from "./types";

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertRecord(value: unknown, path: string): UnknownRecord {
  if (!isRecord(value)) {
    throw new ContentError(`${path} moet een object zijn.`);
  }
  return value;
}

function assertExactKeys(value: UnknownRecord, keys: string[], path: string): void {
  const actual = Object.keys(value);
  const missing = keys.filter((key) => !actual.includes(key));
  const extra = actual.filter((key) => !keys.includes(key));

  if (missing.length > 0 || extra.length > 0) {
    throw new ContentError(`${path} verwacht exact deze velden: ${keys.join(", ")}.`);
  }
}

function assertString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ContentError(`${path} moet een niet-lege tekst zijn.`);
  }
  return value;
}

function assertNullableString(value: unknown, path: string): string | null {
  if (value === null) {
    return null;
  }
  return assertString(value, path);
}

function assertUrl(value: unknown, path: string): string {
  const text = assertString(value, path);
  let url: URL;

  try {
    url = new URL(text);
  } catch {
    throw new ContentError(`${path} is geen URL.`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ContentError(`${path} moet met http of https beginnen.`);
  }

  return text;
}

function assertEmail(value: unknown, path: string): string {
  const text = assertString(value, path);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    throw new ContentError(`${path} is geen e-mailadres.`);
  }
  return text;
}

function assertDate(value: unknown, path: string): string {
  const text = assertString(value, path);
  try {
    parseCalendarDate(text);
  } catch {
    throw new ContentError(`${path} moet een datum zijn als JJJJ-MM-DD.`);
  }
  return text;
}

function assertStringList(value: unknown, path: string, pattern?: RegExp): string[] {
  if (!Array.isArray(value)) {
    throw new ContentError(`${path} moet een lijst zijn.`);
  }

  const items = value.map((item, index) => {
    const text = assertString(item, `${path}[${index}]`);
    if (pattern && !pattern.test(text)) {
      throw new ContentError(`${path}[${index}] heeft een ongeldige bestandsnaam.`);
    }
    return text;
  });

  if (new Set(items).size !== items.length) {
    throw new ContentError(`${path} bevat dubbele waarden.`);
  }

  return items;
}

function assertImageSrc(value: unknown, path: string): string {
  const text = assertString(value, path);
  if (!text.startsWith("/images/") || text.includes("..")) {
    throw new ContentError(`${path} moet een pad onder /images/ zijn.`);
  }
  return text;
}

const PERSONAL_KEYS = [
  "fullName",
  "function",
  "email",
  "education",
  "developingStartDate",
  "linkedIn",
  "portfolioUrl",
  "location",
  "foreword",
  "dateOfBirth",
  "github",
  "githubDescription",
];

function parsePersonal(value: unknown): Personal {
  const record = assertRecord(value, "personal");
  assertExactKeys(record, PERSONAL_KEYS, "personal");

  return {
    fullName: assertString(record.fullName, "personal.fullName"),
    function: assertString(record.function, "personal.function"),
    email: assertEmail(record.email, "personal.email"),
    education: assertString(record.education, "personal.education"),
    developingStartDate: assertDate(record.developingStartDate, "personal.developingStartDate"),
    linkedIn: assertUrl(record.linkedIn, "personal.linkedIn"),
    portfolioUrl: assertUrl(record.portfolioUrl, "personal.portfolioUrl"),
    location: assertString(record.location, "personal.location"),
    foreword: assertString(record.foreword, "personal.foreword"),
    dateOfBirth: assertDate(record.dateOfBirth, "personal.dateOfBirth"),
    github: assertUrl(record.github, "personal.github"),
    githubDescription: assertString(record.githubDescription, "personal.githubDescription"),
  };
}

function parseSkill(value: unknown, index: number): Skill {
  const path = `skills[${index}]`;
  const record = assertRecord(value, path);
  assertExactKeys(record, ["name", "percentage", "category"], path);

  if (typeof record.percentage !== "number" || !Number.isInteger(record.percentage)) {
    throw new ContentError(`${path}.percentage moet een geheel getal zijn.`);
  }
  if (record.percentage < 0 || record.percentage > 100) {
    throw new ContentError(`${path}.percentage moet tussen 0 en 100 liggen.`);
  }
  if (typeof record.category !== "string" || !SKILL_CATEGORIES.includes(record.category as Skill["category"])) {
    throw new ContentError(`${path}.category moet skills, framework of other zijn.`);
  }

  return {
    name: assertString(record.name, `${path}.name`),
    percentage: record.percentage,
    category: record.category as Skill["category"],
  };
}

function parseProject(value: unknown, index: number): ProjectInput {
  const path = `projects[${index}]`;
  const record = assertRecord(value, path);
  assertExactKeys(
    record,
    ["company", "title", "shortDescription", "longDescription", "keywords", "images"],
    path,
  );

  const keywords = assertStringList(record.keywords, `${path}.keywords`);
  if (keywords.length === 0) {
    throw new ContentError(`${path}.keywords mag niet leeg zijn.`);
  }

  return {
    company: assertString(record.company, `${path}.company`),
    title: assertString(record.title, `${path}.title`),
    shortDescription: assertString(record.shortDescription, `${path}.shortDescription`),
    longDescription: assertNullableString(record.longDescription, `${path}.longDescription`),
    keywords,
    images: assertStringList(record.images, `${path}.images`, /^[A-Za-z0-9._-]+\.svg$/),
  };
}

function parseBanner(value: unknown, index: number): Banner {
  const path = `banners[${index}]`;
  const record = assertRecord(value, path);
  assertExactKeys(record, ["title", "bgImage", "laptopImage", "mobileImage"], path);

  const image = (field: "bgImage" | "laptopImage" | "mobileImage") => {
    const imageRecord = assertRecord(record[field], `${path}.${field}`);
    assertExactKeys(imageRecord, ["src"], `${path}.${field}`);
    return { src: assertImageSrc(imageRecord.src, `${path}.${field}.src`) };
  };

  return {
    title: assertString(record.title, `${path}.title`),
    bgImage: image("bgImage"),
    laptopImage: image("laptopImage"),
    mobileImage: image("mobileImage"),
  };
}

export function parseContent(input: {
  personal: unknown;
  skills: unknown;
  projects: unknown;
  banners: unknown;
}): Content {
  if (!Array.isArray(input.skills) || input.skills.length === 0) {
    throw new ContentError("skills moet een niet-lege lijst zijn.");
  }
  if (!Array.isArray(input.projects)) {
    throw new ContentError("projects moet een lijst zijn.");
  }
  if (!Array.isArray(input.banners) || input.banners.length === 0) {
    throw new ContentError("banners moet een niet-lege lijst zijn.");
  }

  return {
    personal: parsePersonal(input.personal),
    skills: input.skills.map(parseSkill),
    projects: input.projects.map(parseProject),
    banners: input.banners.map(parseBanner),
  };
}
