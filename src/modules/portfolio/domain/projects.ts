import type { Project, ProjectDraft } from "./model";

export function assignProjectIds(projects: ProjectDraft[]): Project[] {
  return projects.map((project, index) => ({
    ...project,
    id: index + 1,
  }));
}

export function collectKeywords(projects: Project[]): string[] {
  const keywords: string[] = [];

  for (const project of projects) {
    for (const keyword of project.keywords) {
      if (!keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    }
  }

  return keywords;
}

export function parseKeywords(value: string | string[] | undefined): string[] {
  if (value == null) {
    return [];
  }

  const parts = Array.isArray(value) ? value : [value];
  const keywords: string[] = [];

  for (const part of parts) {
    for (const keyword of part.split(",")) {
      const trimmed = keyword.trim();
      if (trimmed && !keywords.includes(trimmed)) {
        keywords.push(trimmed);
      }
    }
  }

  return keywords;
}

export function effectiveSelection(catalog: string[], requested: string[]): string[] {
  return catalog.filter((keyword) => requested.includes(keyword));
}

export function toggleKeyword(catalog: string[], selected: string[], key: string): string[] {
  if (!catalog.includes(key)) {
    return effectiveSelection(catalog, selected);
  }

  const turningOn = !selected.includes(key);
  return catalog.filter((keyword) =>
    turningOn ? selected.includes(keyword) || keyword === key : selected.includes(keyword) && keyword !== key,
  );
}

export function filterProjects(projects: Project[], selected: string[]): Project[] {
  if (selected.length === 0) {
    return projects;
  }

  return projects.filter((project) => project.keywords.some((keyword) => selected.includes(keyword)));
}
