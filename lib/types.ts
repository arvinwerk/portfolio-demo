export const SKILL_CATEGORIES = ["skills", "framework", "other"] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export type Personal = {
  fullName: string;
  function: string;
  email: string;
  education: string;
  developingStartDate: string;
  linkedIn: string;
  portfolioUrl: string;
  location: string;
  foreword: string;
  dateOfBirth: string;
  github: string;
  githubDescription: string;
};

export type Skill = {
  name: string;
  percentage: number;
  category: SkillCategory;
};

export type ProjectInput = {
  company: string;
  title: string;
  shortDescription: string;
  longDescription: string | null;
  keywords: string[];
  images: string[];
};

export type Project = ProjectInput & {
  id: number;
};

export type BannerImage = {
  src: string;
};

export type Banner = {
  title: string;
  bgImage: BannerImage;
  laptopImage: BannerImage;
  mobileImage: BannerImage;
};

export type Content = {
  personal: Personal;
  skills: Skill[];
  projects: ProjectInput[];
  banners: Banner[];
};

export type SkillGroup = {
  category: SkillCategory;
  label: string;
  skills: Skill[];
};

export type KeywordLink = {
  key: string;
  selected: boolean;
  href: string;
};

export type PageModel = {
  personal: Personal;
  yearsAsDeveloper: number;
  forewordParagraphs: string[];
  githubParagraphs: string[];
  skillGroups: SkillGroup[];
  banners: Banner[];
  keywordLinks: KeywordLink[];
  allSelected: boolean;
  selectedKeywords: string[];
  allProjects: Project[];
  projects: Project[];
};
