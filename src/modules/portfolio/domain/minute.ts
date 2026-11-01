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

/** Persoonlijke zinnen voor de stappen wie en deur. De overige zinnen beschrijven deze pagina en blijven in de code. */
export type MinuteVoice = {
  who: string;
  door: string;
};

const BEAT_CHROME: Record<MinuteBeat, { kicker: string; title: string; line: string | null }> = {
  wie: { kicker: "Wie", title: "Eerst het vak", line: null },
  bewijs: {
    kicker: "Bewijs",
    title: "Eén project",
    line: "Niet de hele lijst. Het project met de meeste trefwoorden, zodat het filter meteen iets te doen heeft.",
  },
  oordeel: {
    kicker: "Oordeel",
    title: "Eén grens",
    line: "Een antwoord mag een werkruimte openen. Het mag geen code zijn die deze pagina uitvoert.",
  },
  deur: { kicker: "Deur", title: "Hier kun je verder", line: null },
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

export function minuteKicker(beat: MinuteBeat): string {
  return BEAT_CHROME[beat].kicker;
}

export function minuteCopy(beat: MinuteBeat, facts: MinuteFacts, voice: MinuteVoice): MinuteCopy {
  const chrome = BEAT_CHROME[beat];
  const line =
    beat === "wie" ? renderMinuteVoice(voice.who, facts) : beat === "deur" ? renderMinuteVoice(voice.door, facts) : chrome.line;
  return { kicker: chrome.kicker, title: chrome.title, line: line ?? "" };
}

function renderMinuteVoice(template: string, facts: MinuteFacts): string {
  const projectWord = facts.projects === 1 ? "project" : "projecten";
  return template
    .replaceAll("${years}", String(facts.years))
    .replaceAll("${projects}", String(facts.projects))
    .replaceAll("${projectWord}", projectWord);
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
