import type { Skill, SkillCategory, SkillGroup } from "./model";

const CATEGORY_ORDER: SkillCategory[] = ["skills", "framework", "other"];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  skills: "Professional",
  framework: "Frameworks",
  other: "Other",
};

export function groupSkills(skills: Skill[]): SkillGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: SKILL_CATEGORY_LABELS[category],
    skills: skills.filter((skill) => skill.category === category),
  })).filter((group) => group.skills.length > 0);
}
