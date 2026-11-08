export type VisitorDoor = "recruiter" | "acquaintance" | "stranger";

export type DoorOpening = {
  id: VisitorDoor;
  label: string;
  hint: string;
  prompt: string;
  placeholder: string;
  question?: string;
};

export const DOOR_QUESTION = "Hoe kom je hier binnen?";

export const RECRUITER_PROMPT = "Wat voor developer zoek je?";

export const RECRUITER_PLACEHOLDER = "Bijvoorbeeld Angular en een rustig team";

export const ACQUAINTANCE_PROMPT = "Je wilt vast weten waar ik nu werk, en wat ik doe.";

export const ACQUAINTANCE_QUESTION = "Waar werk je nu en wat doe je?";

const SKILL_ASK = /\b(kun je|kan je|ken je|beheers je|ervaring met|werk je met|programmeren)\b/i;

export function recruiterQuestion(text: string): string {
  const trimmed = text.trim();
  if (trimmed.endsWith("?") || SKILL_ASK.test(trimmed)) {
    return trimmed;
  }
  return `Kun je ook ${trimmed}?`;
}

export function strangerPrompt(name: string): string {
  return `${name}. Frontend developer, en dit is een demo. De naam is verzonnen, het vak niet. Interfaces waarin de inhoud voorop staat. Vraag gerust naar werk, opleiding of contact.`;
}

export function givenName(fullName: string): string {
  const [name] = fullName.trim().split(/\s+/);
  return name && name.length > 0 ? name : "deze developer";
}

export function visitorDoors(fullName: string): readonly DoorOpening[] {
  const name = givenName(fullName);
  return [
    {
      id: "recruiter",
      label: "Ik zoek iemand",
      hint: "Recruiter",
      prompt: RECRUITER_PROMPT,
      placeholder: RECRUITER_PLACEHOLDER,
    },
    {
      id: "acquaintance",
      label: `Ik ken ${name}`,
      hint: "Even bijpraten",
      prompt: ACQUAINTANCE_PROMPT,
      placeholder: "Vraag gerust verder",
      question: ACQUAINTANCE_QUESTION,
    },
    {
      id: "stranger",
      label: "Ik liep binnen",
      hint: "Eerste indruk",
      prompt: strangerPrompt(name),
      placeholder: "Vraag gerust iets",
    },
  ];
}
