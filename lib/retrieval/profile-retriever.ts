import type { RagChunk } from "./markdown-index";

export type ProfileSearch = {
  found: boolean;
  fragments: RagChunk[];
  note?: string;
};

export type ProfileRetriever = {
  search(query: string): ProfileSearch;
};
