export const SKILL_CATEGORIES = ["skills", "framework", "other"] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

/** Zinnen over deze persoon. Ze staan in content/personal.json en horen vervangen te worden. Knoppen en navigatie horen hier niet. */
export type PersonalStatements = {
  disclaimer: string;
  footerNote: string;
  metaDescription: string;
  chatWelcome: string;
  chatHonesty: string;
  minuteWho: string;
  minuteDoor: string;
};

export type PersonalProfile = {
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
  statements: PersonalStatements;
};

export type Skill = {
  name: string;
  percentage: number;
  category: SkillCategory;
};

export type ProjectDraft = {
  company: string;
  title: string;
  shortDescription: string;
  longDescription: string | null;
  keywords: string[];
  images: string[];
};

export type Project = ProjectDraft & {
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

export type SkillGroup = {
  category: SkillCategory;
  label: string;
  skills: Skill[];
};
