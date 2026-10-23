import "server-only";

import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { indexMarkdown, searchChunks, type RagChunk } from "./markdown-index";
import type { ProfileRetriever, ProfileSearch } from "./profile-retriever";

export const MAX_PROFILE_BYTES = 64 * 1024;

export class ProfileStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileStoreError";
  }
}

export function profileFileName(env: Record<string, string | undefined>): string {
  const configured = env.RAG_DOCUMENT_PATH?.trim();
  const name = configured ? configured : "profile.md";
  if (name !== path.basename(name)) {
    throw new ProfileStoreError("RAG_DOCUMENT_PATH moet een bestandsnaam in content/rag zijn.");
  }
  return name;
}

export class FileProfileStore {
  private cache: { key: string; chunks: RagChunk[] } | undefined;

  constructor(private readonly directory: string) {}

  search(query: string, fileName: string): ProfileSearch {
    try {
      const fragments = searchChunks(this.load(fileName), query);
      if (fragments.length === 0) {
        return { found: false, fragments: [] };
      }
      return { found: true, fragments };
    } catch (error) {
      return { found: false, fragments: [], note: noteFor(error) };
    }
  }

  private load(fileName: string): RagChunk[] {
    if (fileName !== path.basename(fileName)) {
      throw new ProfileStoreError("RAG_DOCUMENT_PATH moet een bestandsnaam in content/rag zijn.");
    }

    const file = path.join(this.directory, fileName);
    const stat = statSync(file);
    if (stat.size > MAX_PROFILE_BYTES) {
      throw new ProfileStoreError("Het profielbestand is te groot.");
    }

    const key = `${file}:${stat.mtimeMs}:${stat.size}`;
    if (this.cache?.key === key) {
      return this.cache.chunks;
    }

    const chunks = indexMarkdown(readFileSync(file, "utf8"));
    this.cache = { key, chunks };
    return chunks;
  }
}

const shared = new FileProfileStore(path.join(process.cwd(), "content", "rag"));

export function createProfileRetriever(env: Record<string, string | undefined> = process.env): ProfileRetriever {
  return {
    search(query: string) {
      try {
        return shared.search(query, profileFileName(env));
      } catch (error) {
        return { found: false, fragments: [], note: noteFor(error) };
      }
    },
  };
}

function noteFor(error: unknown): string {
  return error instanceof ProfileStoreError ? error.message : "Het profielbestand is niet beschikbaar.";
}
