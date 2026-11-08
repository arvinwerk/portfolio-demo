import { formatDutchDate, fullYearsBetween } from "./iso-date";
import type { RecruiterFacts, RecruiterProject } from "./recruiter-facts";

const ABSENT = "Dat staat niet in het profiel.";

const FILLER = new Set([
  "ook",
  "wel",
  "even",
  "graag",
  "programmeren",
  "programeren",
  "werken",
  "doen",
  "maken",
  "bouwen",
  "gedaan",
  "gemaakt",
  "gebouwd",
  "gebruikt",
  "gewerkt",
  "laten",
  "zien",
  "noemen",
]);

const STOP = new Set([
  "dat",
  "dit",
  "het",
  "een",
  "de",
  "meer",
  "iets",
  "daar",
  "hier",
  "nou",
  "al",
  "nog",
  "mij",
  "me",
  "je",
  "jij",
  "ons",
  "wat",
  "hoe",
  "waar",
  "wanneer",
  "waarom",
  "welke",
  "welk",
  "wie",
  "jouw",
  "mijn",
  "met",
  "voor",
  "van",
  "naar",
  "over",
  "aan",
  "op",
  "in",
  "te",
  "en",
  "of",
  "niet",
  "geen",
  "ja",
  "nee",
]);

export function answerRecruiter(facts: RecruiterFacts, question: string, now: Date): string {
  const lowered = question.toLowerCase();

  if (/salaris|tarief|\bloon\b|salary|verdien/.test(lowered)) {
    return ABSENT;
  }
  if (/\b(starten|beschikbaar|beschikbaarheid|opzegtermijn|ingangsdatum)\b/.test(lowered)) {
    return ABSENT;
  }
  if (/\b(echt|verzonnen|fictief|fictie|nep)\b/.test(lowered)) {
    return "Ja. Ik ben een verzonnen demopersona en de projecten zijn dat ook.";
  }
  if (/\b(hoe oud|leeftijd)\b/.test(lowered)) {
    return `Ik ben ${fullYearsBetween(now, facts.bornOn)} jaar, geboren op ${formatDutchDate(facts.bornOn)}.`;
  }
  if (/\b(geboren|geboortedatum)\b/.test(lowered)) {
    return `Ik ben geboren op ${formatDutchDate(facts.bornOn)}.`;
  }
  if (/\b(opleiding|gestudeerd|studie|hogeschool|universiteit|diploma)\b/.test(lowered)) {
    return `Mijn opleiding is ${facts.education}.`;
  }
  if (/\b(hoeveel jaar|hoe lang|sinds wanneer)\b/.test(lowered)) {
    return `Ik bouw ${fullYearsBetween(now, facts.interfacesSince)} jaar interfaces, sinds ${formatDutchDate(facts.interfacesSince)}.`;
  }
  if (/\b(woon|woont|woonplaats)\b/.test(lowered)) {
    return `Ik woon in ${facts.residence}.`;
  }
  if (/\bgithub\b/.test(lowered)) {
    return `De GitHub-link in deze demo is ${facts.github}. Er staat geen echt account achter.`;
  }
  if (/\b(e-mail|email|mail|contact|bereiken|telefoon)\b/.test(lowered)) {
    return `Je bereikt me via ${facts.contact}.`;
  }
  if (/\b(waar werk|werk je nu|huidige|op dit moment)\b/.test(lowered)) {
    return `Ik werk ${facts.currentWork}.`;
  }
  if (/\b(project|projecten|campagne|campagnes)\b/.test(lowered)) {
    return projectAnswer(facts, question);
  }
  if (/\b(kun je|kan je|ken je|beheers je|ervaring met|werk je met|programmeren)\b/.test(lowered)) {
    const skill = skillAnswer(facts, question);
    if (skill) {
      return skill;
    }
  }

  return introduction(facts, now);
}

function introduction(facts: RecruiterFacts, now: Date): string {
  const years = fullYearsBetween(now, facts.interfacesSince);
  return `Ik ben ${facts.name}, ${facts.role} in ${facts.residence}. Ik bouw ${years} jaar interfaces, sinds ${formatDutchDate(facts.interfacesSince)}. De persoon en de projecten zijn verzonnen.`;
}

function projectAnswer(facts: RecruiterFacts, question: string): string {
  const requested = requestedTechs(facts, question, question.match(/\bmet\s+(.+)$/i)?.[1] ?? "");
  if (requested.known.length === 0 && requested.unknown.length === 0) {
    return facts.projects.map(projectLine).join(" ");
  }

  const wanted = [...requested.known, ...requested.unknown];
  const matches = facts.projects.filter((project) =>
    wanted.every((tech) => project.stack.some((item) => fold(item) === fold(tech))),
  );
  if (matches.length === 0) {
    return ABSENT;
  }
  return matches.map(projectSentence).join(" ");
}

function projectLine(project: RecruiterProject): string {
  return `${project.client}, ${project.title} (${joinDutch(project.stack)}).`;
}

function projectSentence(project: RecruiterProject): string {
  return `${project.client}, ${project.title}. Daar gebruikte ik ${joinDutch(project.stack)}.`;
}

function skillAnswer(facts: RecruiterFacts, question: string): string | undefined {
  const fragment = question.match(/\b(?:ervaring met|kun je|kan je|ken je|beheers je|werk je met)\s+(.+)$/i)?.[1] ?? question;
  const requested = requestedTechs(facts, question, fragment);
  if (requested.known.length === 0 && requested.unknown.length === 0) {
    return undefined;
  }
  return skillSentence(requested.known, requested.unknown.map(labelUnknown));
}

function skillSentence(known: readonly string[], unknown: readonly string[]): string {
  if (known.length === 0) {
    return `Nee. ${joinDutch(unknown)} ${verb(unknown)} niet bij de vaardigheden.`;
  }
  if (unknown.length === 0) {
    return `Ja. ${joinDutch(known)} ${verb(known)} bij de vaardigheden.`;
  }
  return `${joinDutch(known)} ${verb(known)} bij de vaardigheden. ${joinDutch(unknown)} ${verb(unknown)} er niet bij.`;
}

function requestedTechs(facts: RecruiterFacts, question: string, fragment: string): { known: string[]; unknown: string[] } {
  const known = facts.skills.filter((skill) => mentioned(question, skill));
  const unknown = techPhrases(fragment).filter((phrase) => !facts.skills.some((skill) => fold(skill) === fold(phrase)));
  return { known, unknown };
}

function techPhrases(fragment: string): string[] {
  return fragment.split(/\s+en\s+|,|\/|\+/).flatMap((part) => {
    const words = (part.toLowerCase().match(/[a-z0-9.+#]+/g) ?? []).filter((word) => {
      const bare = word.replace(/[^a-z0-9]+/g, "");
      return bare.length > 0 && !FILLER.has(bare) && !STOP.has(bare);
    });
    if (words.length === 0) {
      return [];
    }
    return [words.join(" ")];
  });
}

function mentioned(question: string, skill: string): boolean {
  const folded = fold(skill);
  const pieces = (question.toLowerCase().match(/[a-z0-9.+#]+/g) ?? [])
    .map((word) => word.replace(/[^a-z0-9]+/g, ""))
    .filter((word) => word.length > 0);
  if (pieces.includes(folded)) {
    return true;
  }
  for (let index = 0; index < pieces.length - 1; index += 1) {
    if (pieces[index] + pieces[index + 1] === folded) {
      return true;
    }
  }
  return false;
}

function fold(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function labelUnknown(phrase: string): string {
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

function verb(items: readonly string[]): "staat" | "staan" {
  return items.length === 1 ? "staat" : "staan";
}

function joinDutch(items: readonly string[]): string {
  if (items.length <= 1) {
    return items[0] ?? "";
  }
  return `${items.slice(0, -1).join(", ")} en ${items[items.length - 1]}`;
}
