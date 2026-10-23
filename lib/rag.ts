import "server-only";

import { readFileSync, statSync } from "node:fs";
import path from "node:path";

export type RagChunk = {
  heading: string;
  text: string;
};

export type ProfileSearch = {
  found: boolean;
  fragments: RagChunk[];
  note?: string;
};

const STOP_WORDS = new Set([
  "de",
  "het",
  "een",
  "en",
  "van",
  "in",
  "op",
  "te",
  "dat",
  "die",
  "voor",
  "met",
  "naar",
  "aan",
  "om",
  "als",
  "bij",
  "uit",
  "er",
  "niet",
]);

let cached: { key: string; chunks: RagChunk[] } | undefined;

export function profileFileName(env: Record<string, string | undefined> = process.env): string {
  const configured = env.RAG_DOCUMENT_PATH?.trim();
  const name = configured ? configured : "profile.md";
  if (name !== path.basename(name)) {
    throw new Error("RAG_DOCUMENT_PATH moet een bestandsnaam in content/rag zijn.");
  }
  return name;
}

export function indexMarkdown(markdown: string): RagChunk[] {
  const source = markdown.replace(/<!--[\s\S]*?-->/g, "").replace(/\r\n/g, "\n");
  const chunks: { heading: string; lines: string[] }[] = [];
  let current = { heading: "Profiel", lines: [] as string[] };

  for (const line of source.split("\n")) {
    const heading = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      chunks.push(current);
      current = { heading: heading[2].trim(), lines: [] };
      continue;
    }
    current.lines.push(line);
  }
  chunks.push(current);

  return chunks
    .map((chunk) => ({ heading: chunk.heading, text: chunk.lines.join("\n").trim() }))
    .filter((chunk) => chunk.text.length > 0);
}

export function searchChunks(chunks: RagChunk[], query: string, limit = 3): RagChunk[] {
  const terms = tokenize(query).slice(0, 12);
  if (terms.length === 0) {
    return [];
  }

  return chunks
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, terms) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.chunk);
}

export function searchProfile(query: string, env: Record<string, string | undefined> = process.env): ProfileSearch {
  try {
    const fragments = searchChunks(loadProfileChunks(env), query);
    if (fragments.length === 0) {
      return { found: false, fragments: [] };
    }
    return { found: true, fragments };
  } catch {
    return { found: false, fragments: [], note: "Het profielbestand is niet beschikbaar." };
  }
}

function loadProfileChunks(env: Record<string, string | undefined>): RagChunk[] {
  const file = path.join(process.cwd(), "content", "rag", profileFileName(env));
  const stat = statSync(file);
  const key = `${file}:${stat.mtimeMs}:${stat.size}`;
  if (cached?.key === key) {
    return cached.chunks;
  }

  const chunks = indexMarkdown(readFileSync(file, "utf8"));
  cached = { key, chunks };
  return chunks;
}

function scoreChunk(chunk: RagChunk, terms: string[]): number {
  const counts = new Map<string, number>();
  for (const token of tokenize(`${chunk.heading}\n${chunk.text}`)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return terms.reduce((total, term) => total + (counts.get(term) ?? 0) + (chunk.heading.toLowerCase().includes(term) ? 2 : 0), 0);
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}
