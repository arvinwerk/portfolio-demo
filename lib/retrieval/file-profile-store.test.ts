import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { FileProfileStore, MAX_PROFILE_BYTES, createProfileRetriever } from "./file-profile-store";

const directory = path.join(process.cwd(), "content", "rag");

function write(name: string, contents: string | Buffer) {
  const file = path.join(directory, name);
  writeFileSync(file, contents);
  return file;
}

describe("FileProfileStore", () => {
  it("leest een bestand en ziet een vervangen versie", () => {
    const name = "profile-replace.md";
    const file = path.join(directory, name);
    const store = new FileProfileStore(directory);
    try {
      write(name, "## Werk\n\nAlleen de eerste versie.\n");
      expect(store.search("versie", name).fragments[0]?.text).toContain("eerste versie");

      write(name, "## Werk\n\nDit is de vervangen tekst voor deploy.\n");
      expect(store.search("vervangen", name).fragments[0]?.text).toContain("vervangen tekst");
    } finally {
      rmSync(file, { force: true });
    }
  });

  it("weigert een bestand dat groter is dan de grens", () => {
    const name = "profile-large.md";
    const file = path.join(directory, name);
    const store = new FileProfileStore(directory);
    try {
      write(name, Buffer.alloc(MAX_PROFILE_BYTES + 1, "a"));
      expect(store.search("werk", name)).toEqual({
        found: false,
        fragments: [],
        note: "Het profielbestand is te groot.",
      });
    } finally {
      rmSync(file, { force: true });
    }
  });

  it("houdt de cache per store", () => {
    const name = "profile-cache.md";
    const file = path.join(directory, name);
    const first = new FileProfileStore(directory);
    const second = new FileProfileStore(directory);
    try {
      write(name, "## Werk\n\nEerste winkel.\n");
      expect(first.search("eerste", name).found).toBe(true);
      write(name, "## Werk\n\nTweede winkel met andere tekst.\n");
      expect(second.search("tweede", name).fragments[0]?.text).toContain("Tweede winkel");
    } finally {
      rmSync(file, { force: true });
    }
  });
});

describe("createProfileRetriever", () => {
  it("zegt het als het bestand ontbreekt of buiten de map wijst", () => {
    expect(createProfileRetriever({ RAG_DOCUMENT_PATH: "bestaat-niet.md" }).search("werk")).toEqual({
      found: false,
      fragments: [],
      note: "Het profielbestand is niet beschikbaar.",
    });
    expect(createProfileRetriever({ RAG_DOCUMENT_PATH: "../personal.json" }).search("werk")).toEqual({
      found: false,
      fragments: [],
      note: "RAG_DOCUMENT_PATH moet een bestandsnaam in content/rag zijn.",
    });
  });
});
