import "server-only";

import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import BM25, { type BMDocument } from "okapibm25";
import type { ProfileFragment, ProfileKnowledge, ProfileSearch } from "../domain/profile-knowledge";

export const MAX_PROFILE_BYTES = 64 * 1024;

const TOP_K = 3;
const TEXT_EXTENSIONS = new Set([".txt", ".md", ".markdown"]);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 40,
});

export class ProfileStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileStoreError";
  }
}

type IndexedChunk = {
  source: string;
  text: string;
  lowered: string;
};

export class FileProfileStore {
  private cache: { key: string; chunks: IndexedChunk[] } | undefined;

  constructor(private readonly directory: string) {}

  async search(query: string, fileName?: string): Promise<ProfileSearch> {
    try {
      const keywords = tokenize(query.slice(0, 500));
      if (keywords.length === 0) {
        return { found: false, fragments: [] };
      }

      const chunks = await this.load(fileName);
      if (chunks.length === 0) {
        return { found: false, fragments: [] };
      }

      const ranked = BM25(
        chunks.map((chunk) => chunk.lowered),
        keywords,
        undefined,
        (left, right) => right.score - left.score,
      ) as BMDocument[];
      const fragments = takeFragments(chunks, ranked);
      if (fragments.length === 0) {
        return { found: false, fragments: [] };
      }
      return { found: true, fragments };
    } catch (error) {
      return { found: false, fragments: [], note: noteFor(error) };
    }
  }

  private async load(fileName?: string): Promise<IndexedChunk[]> {
    const names = this.fileNames(fileName);
    const stats = names.map((name) => {
      const file = resolveInside(this.directory, name);
      const stat = statSync(/*turbopackIgnore: true*/ file);
      if (!stat.isFile()) {
        throw new ProfileStoreError("Het profielbestand is niet beschikbaar.");
      }
      if (stat.size > MAX_PROFILE_BYTES) {
        throw new ProfileStoreError("Het profielbestand is te groot.");
      }
      return { name, file, mtimeMs: stat.mtimeMs, size: stat.size };
    });

    const key = stats.map((item) => `${item.name}:${item.mtimeMs}:${item.size}`).join("|");
    if (this.cache?.key === key) {
      return this.cache.chunks;
    }

    const documents = stats.map(
      (item) =>
        new Document({
          pageContent: readFileSync(/*turbopackIgnore: true*/ item.file, "utf8"),
          metadata: { source: item.name },
        }),
    );
    const pieces = await splitter.splitDocuments(documents);
    const chunks = pieces.flatMap((piece) => {
      const text = piece.pageContent.trim();
      const lowered = text.toLowerCase();
      if (!/\w/.test(lowered)) {
        return [];
      }
      const source = typeof piece.metadata.source === "string" ? piece.metadata.source : "profiel";
      return [{ source, text, lowered }];
    });
    this.cache = { key, chunks };
    return chunks;
  }

  private fileNames(fileName?: string): string[] {
    if (fileName !== undefined) {
      assertTextFileName(fileName);
      return [fileName];
    }

    const names = readdirSync(/*turbopackIgnore: true*/ this.directory)
      .filter((name) => TEXT_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort();
    if (names.length === 0) {
      throw new ProfileStoreError("Er staan geen tekstdocumenten in content/rag.");
    }
    return names;
  }
}

const stores = new Map<string, FileProfileStore>();

function storeFor(directory: string): FileProfileStore {
  const existing = stores.get(directory);
  if (existing) {
    return existing;
  }
  const created = new FileProfileStore(directory);
  stores.set(directory, created);
  return created;
}

function corpusDirectory(env: Record<string, string | undefined>): string {
  const configured = env.CONTENT_DIR?.trim() ?? "";
  if (configured.length === 0) {
    return path.join(process.cwd(), "content", "rag");
  }
  if (!path.isAbsolute(configured)) {
    throw new ProfileStoreError("CONTENT_DIR moet een absoluut pad zijn.");
  }
  let resolved: string;
  try {
    resolved = realpathSync(/*turbopackIgnore: true*/ configured);
  } catch {
    throw new ProfileStoreError("CONTENT_DIR is niet beschikbaar.");
  }
  if (!statSync(/*turbopackIgnore: true*/ resolved).isDirectory()) {
    throw new ProfileStoreError("CONTENT_DIR moet een map zijn.");
  }
  return path.join(resolved, "rag");
}

export function createProfileKnowledge(env: Record<string, string | undefined> = process.env): ProfileKnowledge {
  return {
    async search(query: string) {
      try {
        return await storeFor(corpusDirectory(env)).search(query, selectedDocument(env));
      } catch (error) {
        return { found: false, fragments: [], note: noteFor(error) };
      }
    },
  };
}

function selectedDocument(env: Record<string, string | undefined>): string | undefined {
  const configured = env.RAG_DOCUMENT_PATH?.trim();
  if (!configured) {
    return undefined;
  }
  assertTextFileName(configured);
  return configured;
}

function assertTextFileName(name: string): void {
  if (name !== path.basename(name)) {
    throw new ProfileStoreError("RAG_DOCUMENT_PATH moet een bestandsnaam in content/rag zijn.");
  }
  if (!TEXT_EXTENSIONS.has(path.extname(name).toLowerCase())) {
    throw new ProfileStoreError("Het corpus bestaat uit tekstbestanden (.txt of .md).");
  }
}

function resolveInside(directory: string, name: string): string {
  let root: string;
  let resolved: string;
  try {
    root = realpathSync(/*turbopackIgnore: true*/ directory);
    resolved = realpathSync(/*turbopackIgnore: true*/ path.join(root, name));
  } catch {
    throw new ProfileStoreError("Het profielbestand is niet beschikbaar.");
  }

  const relative = path.relative(root, resolved);
  if (relative === "" || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new ProfileStoreError("Het profielbestand moet in content/rag blijven.");
  }

  return resolved;
}

function tokenize(value: string): string[] {
  return (value.toLowerCase().match(/\w+/g) ?? []).slice(0, 16);
}

function takeFragments(chunks: IndexedChunk[], ranked: BMDocument[]): ProfileFragment[] {
  const used = new Set<number>();
  const fragments: ProfileFragment[] = [];
  for (const hit of ranked) {
    if (hit.score <= 0 || fragments.length >= TOP_K) {
      continue;
    }
    const index = chunks.findIndex((chunk, position) => !used.has(position) && chunk.lowered === hit.document);
    if (index === -1) {
      continue;
    }
    used.add(index);
    fragments.push({ source: chunks[index].source, text: chunks[index].text });
  }
  return fragments;
}

function noteFor(error: unknown): string {
  return error instanceof ProfileStoreError ? error.message : "Het profielbestand is niet beschikbaar.";
}
