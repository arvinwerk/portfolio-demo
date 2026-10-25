import { toggleKeyword } from "../domain/projects";

export type KeywordLink = {
  key: string;
  selected: boolean;
  href: string;
};

export function keywordsToHref(keywords: string[]): string {
  const hash = "#werk";
  if (keywords.length === 0) {
    return `/${hash}`;
  }

  const params = new URLSearchParams();
  for (const keyword of keywords) {
    params.append("keywords", keyword);
  }

  return `/?${params.toString()}${hash}`;
}

export function keywordLinks(catalog: string[], selected: string[]): KeywordLink[] {
  return catalog.map((key) => ({
    key,
    selected: selected.includes(key),
    href: keywordsToHref(toggleKeyword(catalog, selected, key)),
  }));
}
