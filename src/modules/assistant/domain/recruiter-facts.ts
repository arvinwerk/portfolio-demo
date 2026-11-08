export type RecruiterProject = {
  client: string;
  title: string;
  stack: readonly string[];
};

export type RecruiterFacts = {
  name: string;
  role: string;
  residence: string;
  education: string;
  bornOn: Date;
  interfacesSince: Date;
  currentWork: string;
  skills: readonly string[];
  projects: readonly RecruiterProject[];
  contact: string;
  github: string;
};
