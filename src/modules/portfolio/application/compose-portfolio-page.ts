import type { Banner, PersonalProfile, Project, SkillGroup } from "../domain/model";
import type { Portfolio } from "../domain/portfolio";
import { timelineAt } from "../domain/portfolio";
import { paragraphs, renderForeword } from "../domain/prose";
import { collectKeywords, effectiveSelection, filterProjects, parseKeywords } from "../domain/projects";
import { groupSkills } from "../domain/skills";

export type PortfolioPage = {
  profile: PersonalProfile;
  yearsAsDeveloper: number;
  forewordParagraphs: string[];
  githubParagraphs: string[];
  skillGroups: SkillGroup[];
  banners: Banner[];
  selectedKeywords: string[];
  allProjects: Project[];
  projects: Project[];
};

export function composePortfolioPage(
  portfolio: Portfolio,
  options: {
    now: Date;
    keywords?: string | string[] | undefined;
  },
): PortfolioPage {
  const now = options.now;
  const { age, yearsAsDeveloper } = timelineAt(portfolio.profile, now);
  const selected = effectiveSelection(collectKeywords(portfolio.projects), parseKeywords(options.keywords));

  return {
    profile: portfolio.profile,
    yearsAsDeveloper,
    forewordParagraphs: paragraphs(renderForeword(portfolio.profile.foreword, age, yearsAsDeveloper)),
    githubParagraphs: paragraphs(portfolio.profile.githubDescription),
    skillGroups: groupSkills(portfolio.skills),
    banners: portfolio.banners,
    selectedKeywords: selected,
    allProjects: portfolio.projects,
    projects: filterProjects(portfolio.projects, selected),
  };
}
