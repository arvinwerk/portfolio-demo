import { toggleKeyword } from "../domain/projects";

export type KeywordLink = {
  key: string;
  selected: boolean;
  href: string;
};

export type WorkspaceQuery = {
  lens?: string;
  scenario?: string | null;
};

export function keywordsToHref(keywords: string[], workspace?: WorkspaceQuery): string {
  return workspaceHref({ keywords, lens: workspace?.lens, scenario: workspace?.scenario, hash: "#werk" });
}

export function workspaceHref(input: {
  keywords: string[];
  lens?: string;
  scenario?: string | null;
  hash?: string;
}): string {
  const params = new URLSearchParams();
  if (input.lens && input.lens !== "portrait") {
    params.set("lens", input.lens);
  }
  if (input.lens === "thinking" && input.scenario) {
    params.set("scenario", input.scenario);
  }
  for (const keyword of input.keywords) {
    params.append("keywords", keyword);
  }

  const query = params.toString();
  const hash = input.hash ?? "";
  return `/${query ? `?${query}` : ""}${hash}`;
}

export function keywordLinks(catalog: string[], selected: string[], lens?: string): KeywordLink[] {
  const workspace = lens && lens !== "portrait" ? { lens } : undefined;
  return catalog.map((key) => ({
    key,
    selected: selected.includes(key),
    href: keywordsToHref(toggleKeyword(catalog, selected, key), workspace),
  }));
}
