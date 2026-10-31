export const SURFACES = ["portrait", "work", "thinking", "experiments", "challenge"] as const;

export type Surface = (typeof SURFACES)[number];

export const GUIDANCE_FOCUSES = [
  "keyword-selection",
  "visitor-question",
  "dependency-rule",
  "scalable-assistant",
] as const;

export type GuidanceFocus = (typeof GUIDANCE_FOCUSES)[number];

export type Guidance = {
  surface: Surface;
  focus: GuidanceFocus | null;
  explanation: string;
  origin: "catalog" | "model";
};

export type CatalogReading = {
  matched: boolean;
  surface: Surface;
  focus: GuidanceFocus | null;
  explanation: string;
};

export class GuidanceRejected extends Error {
  constructor(message = "Ongeldig verzoek.") {
    super(message);
    this.name = "GuidanceRejected";
  }
}

const MAX_REQUEST = 280;
const MAX_EXPLANATION = 600;

type Rule = {
  surface: Surface;
  focus: GuidanceFocus | null;
  phrases: string[];
  explanation: string;
};

const RULES: Rule[] = [
  {
    surface: "challenge",
    focus: "scalable-assistant",
    phrases: [
      "scalable ai platform",
      "schaalbaar ai-platform",
      "schaalbare ai",
      "how would you design",
      "hoe zou je ontwerpen",
      "daag me uit",
      "challenge me",
    ],
    explanation:
      "De opdracht legt een AI-laag stap voor stap neer. Elke keuze toont wat hij kost, en of deze pagina hem ook maakt.",
  },
  {
    surface: "experiments",
    focus: null,
    phrases: ["ai experiments", "ai-experimenten", "ai experimenten", "show me your ai", "laat je experimenten"],
    explanation:
      "De experimenten gebruiken het echte zoeken, een openbaar demonstratiezegel en de tempo-grenzen van deze server.",
  },
  {
    surface: "thinking",
    focus: "dependency-rule",
    phrases: [
      "architecture decisions",
      "explain your architecture",
      "architectuurkeuzes",
      "leg je architectuur",
      "afhankelijkheidsregel",
      "how i think",
      "hoe ik denk",
      "architectuur",
      "architecture",
    ],
    explanation: "De kaart toont de contexten en de lagen. De afhankelijkheidsregel is de verkenning die daarbij hoort.",
  },
  {
    surface: "thinking",
    focus: "visitor-question",
    phrases: ["hoe de chat", "how the chat", "zegel", "transcript"],
    explanation: "Deze verkenning volgt een vraag van de bezoeker: tempo, zegel, zoeken, en pas dan het model.",
  },
  {
    surface: "thinking",
    focus: "keyword-selection",
    phrases: ["trefwoord", "trefwoorden", "keyword", "keywords"],
    explanation: "De selectie van projecten staat in het adres. Het domain beslist welke trefwoorden gelden.",
  },
  {
    surface: "work",
    focus: null,
    phrases: [
      "explore your projects",
      "verken je projecten",
      "mijn werk",
      "my work",
      "werkervaring",
      "projecten",
      "projects",
    ],
    explanation: "De projecten blijven filterbaar. Het adres houdt de trefwoorden vast.",
  },
  {
    surface: "portrait",
    focus: null,
    phrases: ["hele pagina", "portret", "landing"],
    explanation: "Het portret toont het profiel, de vaardigheden en het werk onder elkaar.",
  },
];

export function readRequest(value: unknown): string {
  if (typeof value !== "string") {
    throw new GuidanceRejected();
  }
  const text = value.trim();
  if (!text) {
    throw new GuidanceRejected();
  }
  if (text.length > MAX_REQUEST) {
    throw new GuidanceRejected("De vraag is te lang.");
  }
  return text;
}

export function interpretRequest(text: string): CatalogReading {
  const normalized = normalize(text);
  let best: { rule: Rule; length: number } | null = null;

  for (const rule of RULES) {
    for (const phrase of rule.phrases) {
      if (!containsPhrase(normalized, phrase)) {
        continue;
      }
      if (best === null || phrase.length > best.length) {
        best = { rule, length: phrase.length };
      }
    }
  }

  if (!best) {
    return {
      matched: false,
      surface: "portrait",
      focus: null,
      explanation: "Die vraag valt buiten de verkenningen. Vraag naar werk, architectuur, experimenten of een ontwerp.",
    };
  }

  return {
    matched: true,
    surface: best.rule.surface,
    focus: best.rule.focus,
    explanation: best.rule.explanation,
  };
}

export function parseModelGuidance(value: unknown): Omit<Guidance, "origin"> {
  const record = recordOf(value);
  const surface = record.surface;
  if (!isSurface(surface)) {
    throw new GuidanceRejected();
  }

  let focus: GuidanceFocus | null = null;
  if (record.focus !== null && record.focus !== undefined) {
    if (!isFocus(record.focus)) {
      throw new GuidanceRejected();
    }
    focus = record.focus;
  }

  return { surface, focus, explanation: explanationOf(record.explanation) };
}

export function parseGuidance(value: unknown): Guidance {
  const record = recordOf(value);
  const guidance = parseModelGuidance(record);
  if (record.origin !== "catalog" && record.origin !== "model") {
    throw new GuidanceRejected();
  }
  return { ...guidance, origin: record.origin };
}

function recordOf(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new GuidanceRejected();
  }
  return value as Record<string, unknown>;
}

function explanationOf(value: unknown): string {
  if (typeof value !== "string") {
    throw new GuidanceRejected();
  }
  const explanation = value.trim();
  if (!explanation || explanation.length > MAX_EXPLANATION) {
    throw new GuidanceRejected();
  }
  return explanation;
}

function isSurface(value: unknown): value is Surface {
  return typeof value === "string" && (SURFACES as readonly string[]).includes(value);
}

function isFocus(value: unknown): value is GuidanceFocus {
  return typeof value === "string" && (GUIDANCE_FOCUSES as readonly string[]).includes(value);
}

function normalize(text: string): string {
  return text
    .toLocaleLowerCase("nl")
    .replaceAll(/[“”"'!?.,;:()[\]{}]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function containsPhrase(text: string, phrase: string): boolean {
  const needle = normalize(phrase);
  if (!needle) {
    return false;
  }
  if (needle.includes(" ") || needle.includes("-")) {
    return text.includes(needle);
  }
  return text.split(" ").includes(needle);
}
