import { describe, expect, it } from "vitest";
import { groupSkills } from "./skills";
import type { Skill } from "./types";

const skills: Skill[] = [
  { name: "Node.js", percentage: 10, category: "other" },
  { name: "React", percentage: 20, category: "framework" },
  { name: "TypeScript", percentage: 30, category: "skills" },
  { name: "Next.js", percentage: 40, category: "framework" },
];

describe("groupSkills", () => {
  it("zet Professional, Frameworks en Other in die volgorde en behoudt de invoervolgorde", () => {
    expect(groupSkills(skills)).toEqual([
      {
        category: "skills",
        label: "Professional",
        skills: [{ name: "TypeScript", percentage: 30, category: "skills" }],
      },
      {
        category: "framework",
        label: "Frameworks",
        skills: [
          { name: "React", percentage: 20, category: "framework" },
          { name: "Next.js", percentage: 40, category: "framework" },
        ],
      },
      {
        category: "other",
        label: "Other",
        skills: [{ name: "Node.js", percentage: 10, category: "other" }],
      },
    ]);
  });

  it("laat een lege categorie weg", () => {
    expect(groupSkills(skills.filter((skill) => skill.category !== "other")).map((group) => group.label)).toEqual([
      "Professional",
      "Frameworks",
    ]);
  });
});
