import { formatDutchDate, fullYearsBetween } from "./iso-date";
import type { RecruiterFacts } from "./recruiter-facts";

export function recruiterBriefing(facts: RecruiterFacts, now: Date): string {
  const projects = facts.projects
    .map((project) => `${project.client}, ${project.title}. Stack: ${project.stack.join(", ")}.`)
    .join("\n");

  return [
    `Feiten op ${formatDutchDate(now)}:`,
    `Naam: ${facts.name}`,
    `Rol: ${facts.role}`,
    `Woonplaats: ${facts.residence}`,
    `Opleiding: ${facts.education}`,
    `Geboren: ${formatDutchDate(facts.bornOn)}`,
    `Leeftijd: ${fullYearsBetween(now, facts.bornOn)} jaar`,
    `Interfaces sinds: ${formatDutchDate(facts.interfacesSince)}`,
    `Jaren interfaces: ${fullYearsBetween(now, facts.interfacesSince)}`,
    `Werk nu: ${facts.currentWork}`,
    `Vaardigheden: ${facts.skills.join(", ")}`,
    "Projecten:",
    projects,
    `Contact: ${facts.contact}`,
    `GitHub: ${facts.github}`,
    "Niet aanwezig: salaris, tarief, loon, beschikbaarheid, opzegtermijn, ingangsdatum.",
  ].join("\n");
}
