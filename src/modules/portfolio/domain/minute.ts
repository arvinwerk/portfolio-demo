import { architectureAtlas, type TradeOff } from "./architecture-atlas";

export const MINUTE_BEATS = ["wie", "bewijs", "oordeel", "deur"] as const;

export type MinuteBeat = (typeof MINUTE_BEATS)[number];

export type MinuteFacts = {
  years: number;
  projects: number;
};

export type MinuteCopy = {
  kicker: string;
  title: string;
  line: string;
};

export function parseMinute(value: unknown): MinuteBeat | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && (MINUTE_BEATS as readonly string[]).includes(raw) ? (raw as MinuteBeat) : null;
}

export function minuteNeighbour(beat: MinuteBeat, direction: -1 | 1): MinuteBeat | null {
  const index = MINUTE_BEATS.indexOf(beat) + direction;
  if (index < 0 || index >= MINUTE_BEATS.length) {
    return null;
  }
  return MINUTE_BEATS[index];
}

export function minuteCopy(beat: MinuteBeat, facts: MinuteFacts): MinuteCopy {
  switch (beat) {
    case "wie":
      return {
        kicker: "Wie",
        title: "Eerst het vak",
        line: `${facts.years} jaar interfaces. ${facts.projects} ${facts.projects === 1 ? "project" : "projecten"} op deze pagina. De persoon is verzonnen, de grens niet.`,
      };
    case "bewijs":
      return {
        kicker: "Bewijs",
        title: "Eén project",
        line: "Niet de hele lijst. Het project met de meeste trefwoorden, zodat het filter meteen iets te doen heeft.",
      };
    case "oordeel":
      return {
        kicker: "Oordeel",
        title: "Eén grens",
        line: "Een antwoord mag een werkruimte openen. Het mag geen code zijn die deze pagina uitvoert.",
      };
    case "deur":
      return {
        kicker: "Deur",
        title: "Hier kun je verder",
        line: "Een mail is genoeg. LinkedIn en GitHub op deze demo wijzen naar example.com.",
      };
  }
}

export function proofProject<T extends { keywords: readonly string[] }>(projects: readonly T[]): T | null {
  if (projects.length === 0) {
    return null;
  }
  return projects.reduce((best, project) => (proofScore(project) > proofScore(best) ? project : best));
}

export function minuteTradeOff(): TradeOff {
  const atlas = architectureAtlas();
  return atlas.tradeOffs.find((tradeOff) => tradeOff.id === "structured-guidance") ?? atlas.tradeOffs[0];
}

function proofScore(project: { keywords: readonly string[] }): number {
  return project.keywords.length + (project.keywords.includes("React") ? 2 : 0);
}
