import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { FileProfileStore, MAX_PROFILE_BYTES, createProfileKnowledge } from "./bm25-profile-knowledge";

const directories: string[] = [];

function tempCorpus(): string {
  const directory = mkdtempSync(path.join(os.tmpdir(), "profile-rag-"));
  directories.push(directory);
  return directory;
}

function write(directory: string, name: string, contents: string | Buffer) {
  const file = path.join(directory, name);
  writeFileSync(file, contents);
  return file;
}

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("FileProfileStore", () => {
  it("leest platte tekst en ziet een vervangen versie", async () => {
    const directory = tempCorpus();
    const store = new FileProfileStore(directory);

    write(directory, "profile.txt", "Alleen de eerste versie.\n");
    expect((await store.search("versie", "profile.txt")).fragments[0]?.text).toContain("eerste versie");

    write(directory, "profile.txt", "Dit is de vervangen tekst voor deploy.\n");
    expect((await store.search("vervangen", "profile.txt")).fragments[0]?.text).toContain("vervangen tekst");
  });

  it("rangschikt het passende document, ook als dat geen markdown is", async () => {
    const directory = tempCorpus();
    const store = new FileProfileStore(directory);
    write(directory, "contact.txt", "Het contactadres is naam@example.com.\n");
    write(directory, "opleiding.md", "Opleiding: [opleiding].\n");
    write(directory, "geheim.json", "Dit json-bestand hoort niet in de index.\n");

    const education = await store.search("welke opleiding");
    expect(education.fragments).toEqual([
      expect.objectContaining({ source: "opleiding.md", text: expect.stringContaining("[opleiding]") }),
    ]);

    const contact = await store.search("contactadres");
    expect(contact.fragments[0]?.source).toBe("contact.txt");
    expect(await store.search("json-bestand")).toEqual({ found: false, fragments: [] });
  });

  it("weigert een bestand dat groter is dan de grens", async () => {
    const directory = tempCorpus();
    const store = new FileProfileStore(directory);
    write(directory, "profile.txt", Buffer.alloc(MAX_PROFILE_BYTES + 1, "a"));

    expect(await store.search("werk", "profile.txt")).toEqual({
      found: false,
      fragments: [],
      note: "Het profielbestand is te groot.",
    });
  });

  it("volgt geen symlink die buiten de map wijst", async () => {
    const directory = tempCorpus();
    const outside = tempCorpus();
    const secret = write(outside, "secret.txt", "geheim wachtwoord\n");
    symlinkSync(secret, path.join(directory, "profile.txt"));
    const store = new FileProfileStore(directory);

    expect(await store.search("wachtwoord", "profile.txt")).toEqual({
      found: false,
      fragments: [],
      note: "Het profielbestand moet in content/rag blijven.",
    });
  });

  it("zegt het als de map geen tekstbestanden bevat", async () => {
    const directory = tempCorpus();
    write(directory, "personal.json", "{}\n");
    const store = new FileProfileStore(directory);

    expect(await store.search("werk")).toEqual({
      found: false,
      fragments: [],
      note: "Er staan geen tekstdocumenten in content/rag.",
    });
  });

  it("houdt de cache per store", async () => {
    const directory = tempCorpus();
    const first = new FileProfileStore(directory);
    const second = new FileProfileStore(directory);
    write(directory, "profile.txt", "Eerste winkel.\n");
    expect((await first.search("eerste", "profile.txt")).found).toBe(true);

    write(directory, "profile.txt", "Tweede winkel met andere tekst.\n");
    expect((await second.search("tweede", "profile.txt")).fragments[0]?.text).toContain("Tweede winkel");
  });

  it("roept geen rangschikking aan op een lege vraag", async () => {
    const directory = tempCorpus();
    const store = new FileProfileStore(directory);
    write(directory, "profile.txt", "Wel een profiel.\n");

    expect(await store.search("   ")).toEqual({ found: false, fragments: [] });
  });
});

describe("createProfileKnowledge", () => {
  it("leest het corpus uit CONTENT_DIR in plaats van de checkout", async () => {
    const directory = tempCorpus();
    const rag = path.join(directory, "rag");
    mkdirSync(rag);
    write(rag, "profile.txt", "Alleen in de externe map: Kadehuis.");

    const result = await createProfileKnowledge({ CONTENT_DIR: directory }).search("Kadehuis");
    expect(result.fragments[0]?.text).toContain("Kadehuis");
  });

  it("zegt het als het bestand ontbreekt, buiten de map wijst, of geen tekst is", async () => {
    expect(await createProfileKnowledge({ RAG_DOCUMENT_PATH: "bestaat-niet.md" }).search("werk")).toEqual({
      found: false,
      fragments: [],
      note: "Het profielbestand is niet beschikbaar.",
    });
    expect(await createProfileKnowledge({ RAG_DOCUMENT_PATH: "../personal.json" }).search("werk")).toEqual({
      found: false,
      fragments: [],
      note: "RAG_DOCUMENT_PATH moet een bestandsnaam in content/rag zijn.",
    });
    expect(await createProfileKnowledge({ RAG_DOCUMENT_PATH: "personal.json" }).search("werk")).toEqual({
      found: false,
      fragments: [],
      note: "Het corpus bestaat uit tekstbestanden (.txt of .md).",
    });
  });
});
