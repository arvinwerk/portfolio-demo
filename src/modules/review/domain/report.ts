import { isReviewLens, lensTitle, type ReviewLens } from "./lens";
import { sanitizePublicText } from "./sanitize";

export const emptySuggestion = "Vandaag geen bruikbaar voorstel.";
const maxSuggestions = 8;
const maxSuggestionLength = 280;
const maxBodyLength = 2000;

export class ReviewReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewReportError";
  }
}

export type ReviewReport = {
  date: string;
  lens: ReviewLens;
  score: number | null;
  suggestions: readonly string[];
  body: string;
};

export function reviewDate(now: Date, timeZone = "Europe/Amsterdam"): string {
  let formatted: string;
  try {
    formatted = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    throw new ReviewReportError("Tijdzone is ongeldig.");
  }
  if (!isReviewDate(formatted)) {
    throw new ReviewReportError("Datum is ongeldig.");
  }
  return formatted;
}

export function isReviewDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function reportFileName(date: string, lens: ReviewLens): string {
  if (!isReviewDate(date)) {
    throw new ReviewReportError("Datum is ongeldig.");
  }
  return `${date}-${lens}.md`;
}

export function reportIdentity(fileName: string): { date: string; lens: ReviewLens } | undefined {
  const match = /^(\d{4}-\d{2}-\d{2})-(interface|content|findability)\.md$/.exec(fileName);
  if (!match) {
    return undefined;
  }
  const date = match[1];
  const lens = match[2];
  if (!date || !lens || !isReviewDate(date) || !isReviewLens(lens)) {
    return undefined;
  }
  return { date, lens };
}

export function interpretReview(date: string, lens: ReviewLens, raw: string): ReviewReport {
  if (!isReviewDate(date)) {
    throw new ReviewReportError("Datum is ongeldig.");
  }
  const clean = sanitizePublicText(raw);
  const suggestions: string[] = [];
  const prose: string[] = [];
  let score: number | null = null;

  for (const line of clean.split("\n")) {
    const trimmed = line.trim();
    if (
      trimmed.length === 0 ||
      /^#{1,6}\s+/.test(trimmed) ||
      /^geen score\.?$/i.test(trimmed) ||
      isPlaceholderBody(trimmed)
    ) {
      continue;
    }
    const found = readScore(trimmed);
    if (found.matches) {
      score ??= found.score;
      continue;
    }
    const item = /^(?:[-*•]|\d+[.)])\s+(.+)$/.exec(trimmed);
    if (item?.[1]) {
      const nested = readScore(item[1]);
      if (nested.matches) {
        score ??= nested.score;
        continue;
      }
      const suggestion = clip(item[1], maxSuggestionLength);
      if (suggestion.length > 0) {
        suggestions.push(suggestion);
      }
      continue;
    }
    prose.push(trimmed);
  }

  return publishedReport({
    date,
    lens,
    score,
    suggestions,
    body: clip(prose.join("\n\n"), maxBodyLength),
  });
}

export function reviewScore(value: number | null): number | null {
  if (value === null || !Number.isInteger(value) || value < 1 || value > 10) {
    return null;
  }
  return value;
}

export function averageReviewScore(scores: readonly (number | null)[]): number | null {
  const present = scores.filter((score): score is number => score !== null);
  if (present.length === 0) {
    return null;
  }
  return Math.round((present.reduce((sum, score) => sum + score, 0) / present.length) * 10) / 10;
}

export function publishedReport(report: ReviewReport): ReviewReport {
  if (!isReviewDate(report.date) || !isReviewLens(report.lens)) {
    throw new ReviewReportError("Rapport is ongeldig.");
  }
  const suggestions: string[] = [];
  for (const suggestion of report.suggestions) {
    const clean = clip(sanitizePublicText(suggestion).replaceAll("\n", " "), maxSuggestionLength);
    if (clean.length === 0 || clean === emptySuggestion || suggestions.includes(clean)) {
      continue;
    }
    suggestions.push(clean);
    if (suggestions.length === maxSuggestions) {
      break;
    }
  }

  return {
    date: report.date,
    lens: report.lens,
    score: reviewScore(report.score),
    suggestions,
    body: visibleBody(report.body),
  };
}

export function reportHasFinding(report: ReviewReport): boolean {
  const published = publishedReport(report);
  return published.score !== null || published.suggestions.length > 0 || published.body.length > 0;
}

export function renderReportMarkdown(report: ReviewReport): string {
  const published = publishedReport(report);
  const items = published.suggestions.map((suggestion) => `- ${suggestion}`).join("\n");
  const suggestions = items.length > 0 ? `${items}\n\n` : "";
  const body = published.body.length > 0 ? `${published.body}\n` : "";
  const score = published.score === null ? "Geen score" : `${published.score}/10`;
  return `# ${lensTitle[published.lens]}\n\n## Score\n\n${score}\n\n## Suggesties\n\n${suggestions}## Toelichting\n\n${body}`;
}

function visibleBody(value: string): string {
  const clean = clip(sanitizePublicText(value), maxBodyLength);
  return isPlaceholderBody(clean) ? "" : clean;
}

function isPlaceholderBody(value: string): boolean {
  return /^geen toelichting\.?$/i.test(value);
}

function readScore(line: string): { matches: true; score: number | null } | { matches: false } {
  const labeled = /^(?:score|cijfer)\s*[:：]\s*(\d{1,2})(?:\s*\/\s*10)?$/i.exec(line);
  if (labeled?.[1]) {
    return { matches: true, score: reviewScore(Number(labeled[1])) };
  }
  const bare = /^(\d{1,2})\s*\/\s*10$/.exec(line);
  if (bare?.[1]) {
    return { matches: true, score: reviewScore(Number(bare[1])) };
  }
  return { matches: false };
}

export function clip(text: string, max: number): string {
  const normalized = text.replaceAll("\r\n", "\n").trim();
  if (normalized.length <= max) {
    return normalized;
  }
  const slice = normalized.slice(0, max);
  const breakAt = slice.lastIndexOf("\n");
  return (breakAt > max * 0.6 ? slice.slice(0, breakAt) : slice).trim();
}
