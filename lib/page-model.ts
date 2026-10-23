import { differenceInYears, parseCalendarDate } from "./dates";
import { keywordLinks, assignProjectIds, collectKeywords, effectiveSelection, filterProjects, parseKeywords } from "./projects";
import { groupSkills } from "./skills";
import { paragraphs, renderForeword } from "./text";
import type { Content, PageModel } from "./types";

export function buildPageModel(
  content: Content,
  options: {
    now?: Date;
    keywords?: string | string[] | undefined;
  } = {},
): PageModel {
  const now = options.now ?? new Date();
  const personal = content.personal;
  const age = differenceInYears(now, parseCalendarDate(personal.dateOfBirth));
  const yearsAsDeveloper = differenceInYears(now, parseCalendarDate(personal.developingStartDate));

  if (age < 0 || yearsAsDeveloper < 0) {
    throw new Error("Datums in personal.json liggen in de toekomst.");
  }

  const projects = assignProjectIds(content.projects);
  const catalog = collectKeywords(projects);
  const selected = effectiveSelection(catalog, parseKeywords(options.keywords));

  return {
    personal,
    forewordParagraphs: paragraphs(renderForeword(personal.foreword, age, yearsAsDeveloper)),
    githubParagraphs: paragraphs(personal.githubDescription),
    skillGroups: groupSkills(content.skills),
    banners: content.banners,
    keywordLinks: keywordLinks(catalog, selected),
    allSelected: selected.length === 0,
    projects: filterProjects(projects, selected),
  };
}
