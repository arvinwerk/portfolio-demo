export const ARCHITECTURE_SCENARIO_IDS = [
  "keyword-selection",
  "visitor-question",
  "dependency-rule",
  "scalable-assistant",
] as const;

export type ArchitectureScenarioId = (typeof ARCHITECTURE_SCENARIO_IDS)[number];

export type AtlasLayer = "composition" | "context" | "kernel" | "layer";

export type ArchitectureNode = {
  id: string;
  title: string;
  kicker: string;
  layer: AtlasLayer;
  column: number;
  row: number;
  summary: string;
  detail: string;
  excerpt: string | null;
};

export type RelationKind = "calls" | "depends" | "forbids";

export type ArchitectureRelation = {
  id: string;
  from: string;
  to: string;
  label: string;
  kind: RelationKind;
};

export type TradeOff = {
  id: string;
  title: string;
  choice: string;
  gain: string;
  cost: string;
  alternative: string;
};

export type ArchitectureScenario = {
  id: ArchitectureScenarioId;
  title: string;
  question: string;
  summary: string;
  nodeIds: string[];
  relationIds: string[];
  tradeOffIds: string[];
  steps: string[];
};

export type ArchitectureAtlas = {
  nodes: ArchitectureNode[];
  relations: ArchitectureRelation[];
  tradeOffs: TradeOff[];
  scenarios: ArchitectureScenario[];
};

export type PresentedNode = ArchitectureNode & { dimmed: boolean; selected: boolean };

export type PresentedRelation = ArchitectureRelation & { dimmed: boolean };

export type AtlasPresentation = {
  scenario: ArchitectureScenario | null;
  nodes: PresentedNode[];
  relations: PresentedRelation[];
  tradeOffs: TradeOff[];
  selected: ArchitectureNode | null;
};

const nodes: ArchitectureNode[] = [
  {
    id: "composition",
    title: "Compositie",
    kicker: "src/app",
    layer: "composition",
    column: 1,
    row: 0,
    summary: "Routes en de pagina. Geen beslisregels.",
    detail:
      "De pagina laadt het read-model en tekent de facades. De chatroute en de gids geven een verzoek alleen door. Welke selectie geldig is, en wat een antwoord mag zijn, wordt elders beslist.",
    excerpt: "src/app importeert een module alleen via index.ts of server.ts.",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    kicker: "context",
    layer: "context",
    column: 0,
    row: 1,
    summary: "Het gepubliceerde profiel.",
    detail:
      "Persoon, vaardigheden, projecten, banners en de trefwoordselectie horen hier. De nieuwsgierigheid van de bezoeker is dezelfde soort selectie: een ingang die het domain kent, geschreven in het adres.",
    excerpt: null,
  },
  {
    id: "assistant",
    title: "Assistant",
    kicker: "context",
    layer: "context",
    column: 2,
    row: 1,
    summary: "Het gesprek met de bezoeker.",
    detail:
      "Transcript, zegel, profielkennis en tempo. De gids kiest een werkruimte uit een vaste lijst. Het model mag die lijst niet uitbreiden en levert geen code die de pagina uitvoert.",
    excerpt: "Een assistentbeurt telt alleen met een geldig zegel, of als het de vaste welkomstzin is.",
  },
  {
    id: "kernel",
    title: "Kernel",
    kicker: "shared",
    layer: "kernel",
    column: 1,
    row: 2,
    summary: "Technische primitieven, zonder bedrijfsnaam.",
    detail:
      "Geen portfolio- of assistantregel, geen React, geen I/O. De test die de importrichting afdwingt woont hier, zodat een laag die de grens overschrijdt de suite laat falen.",
    excerpt: null,
  },
  {
    id: "interface",
    title: "Interface",
    kicker: "laag",
    layer: "layer",
    column: 0,
    row: 3,
    summary: "HTTP, React en het adres.",
    detail:
      "Een scherm roept een use case aan en tekent het read-model. De URL is de staat van de selectie. De interface schrijft de query; ze importeert geen adapter en geen infrastructure.",
    excerpt: null,
  },
  {
    id: "application",
    title: "Application",
    kicker: "laag",
    layer: "layer",
    column: 1,
    row: 3,
    summary: "Eén use case orkestreert.",
    detail:
      "De use case roept het domain aan en praat met poorten. Hij voegt geen tweede betekenis toe aan een invariant. Tijd, zegel, poort en sessie komen binnen als argument.",
    excerpt: null,
  },
  {
    id: "domain",
    title: "Domain",
    kicker: "laag",
    layer: "layer",
    column: 2,
    row: 3,
    summary: "Regels die waar blijven zonder React of schijf.",
    detail:
      "Leeftijd, trefwoordselectie, de lengte van een beurt en de vorm van een gidsantwoord worden hier beslist. Een ongeldige waarde komt er niet uit. De klok komt binnen als argument.",
    excerpt: "interface → application → domain",
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    kicker: "laag",
    layer: "layer",
    column: 3,
    row: 3,
    summary: "Schijf, index, zegel en het model.",
    detail:
      "JSON gaat door een anti-corruptielaag. BM25 doorzoekt content/rag. HMAC ondertekent een beurt. De Anthropic-adapter ziet de sleutel. Het domain ziet die vendor-types niet.",
    excerpt: null,
  },
];

const relations: ArchitectureRelation[] = [
  { id: "composition-portfolio", from: "composition", to: "portfolio", label: "facade", kind: "calls" },
  { id: "composition-assistant", from: "composition", to: "assistant", label: "facade", kind: "calls" },
  { id: "interface-application", from: "interface", to: "application", label: "use case", kind: "depends" },
  { id: "application-domain", from: "application", to: "domain", label: "regels", kind: "depends" },
  { id: "infrastructure-domain", from: "infrastructure", to: "domain", label: "factory", kind: "depends" },
  { id: "infrastructure-application", from: "infrastructure", to: "application", label: "poort", kind: "depends" },
  { id: "portfolio-assistant", from: "portfolio", to: "assistant", label: "geen import", kind: "forbids" },
  { id: "interface-infrastructure", from: "interface", to: "infrastructure", label: "geen adapter", kind: "forbids" },
];

const tradeOffs: TradeOff[] = [
  {
    id: "url-state",
    title: "Het adres is de selectie",
    choice: "Trefwoorden en de ingang staan in de query.",
    gain: "Een link deelt dezelfde werkruimte. De eerste HTML is al gefilterd. De terugknop hoort bij het scherm.",
    cost: "Niet elke tussenstand hoeft in het adres. De toelichting van de gids blijft in het geheugen van dit bezoek.",
    alternative: "Alleen clientstaat. Dan is een gedeelde link weer de hele pagina, en de server kan de eerste lijst niet snijden.",
  },
  {
    id: "modular-monolith",
    title: "Eén proces, twee contexten",
    choice: "Pagina, content, index en modelroute delen één deploy.",
    gain: "Geen tweede server, geen CORS, en de sleutel staat op één plek. De browser ziet alleen de route.",
    cost: "Het proces schaalt als geheel. Een zware index en een drukke route delen hetzelfde plafond.",
    alternative: "Een aparte modelservice. Die schaalt los, en kost een tweede release, een tweede geheim en een extra netwerkrand.",
  },
  {
    id: "two-contexts",
    title: "Geen derde module voor het scherm",
    choice: "Verkennen hoort bij het profiel. De gids hoort bij het gesprek.",
    gain: "De taal blijft in de context die haar bezit. De compositie legt alleen de gebeurtenis tussen hen.",
    cost: "De namen van de werkruimtes bestaan aan beide kanten van die naad. Een test in de compositie houdt ze gelijk.",
    alternative: "Een context experience. Die vraagt een ADR, omdat het model dan niet in portfolio of assistant past.",
  },
  {
    id: "retrieval",
    title: "Eerst zoeken, dan pas beweren",
    choice: "Het model krijgt alleen fragmenten uit content/rag, via BM25.",
    gain: "Een antwoord over de persoon is herleidbaar. De index draait lokaal en is te testen zonder sleutel.",
    cost: "BM25 mist een parafrase die de woorden niet deelt. Een vectordatabase zou dat vangen, met een tweede systeem en een tweede sleutel.",
    alternative: "Het hele profiel in de systeemprompt. Korter om te bouwen, en elk verzoek sleept het corpus mee.",
  },
  {
    id: "sealed-transcript",
    title: "De browser mag het gesprek niet herschrijven",
    choice: "Een assistentbeurt telt alleen met een HMAC van deze server.",
    gain: "Een verzonnen antwoord of een verzonnen toolresultaat bereikt het model niet.",
    cost: "Wisselt de sleutel, dan vervalt de oude geschiedenis. De handtekening moet mee terug naar de volgende beurt.",
    alternative: "De clientgeschiedenis vertrouwen. Dat is minder ceremonie, en het model volgt dan een tekst die de bezoeker zelf schreef.",
  },
  {
    id: "structured-guidance",
    title: "Een vaste vorm, geen vrije code",
    choice: "De gids levert een werkruimte, een focus en één zin. De pagina heeft die vorm al in het domain.",
    gain: "Het scherm kan een kaart, een lijst of een opdracht openen zonder iets uit te voeren dat het model bedacht.",
    cost: "Een vraag buiten de lijst krijgt geen nieuw soort paneel. De catalogus antwoordt, of het model kiest alsnog uit dezelfde lijst.",
    alternative: "Gegenereerde componenten. Dat oogt vrijer, en het is een uitvoering van onbetrouwbare invoer.",
  },
];

const scenarios: ArchitectureScenario[] = [
  {
    id: "keyword-selection",
    title: "Een bezoeker filtert",
    question: "Wat blijft er over als iemand op React klikt?",
    summary: "De klik schrijft het adres. Het domain houdt alleen trefwoorden die in de projecten staan.",
    nodeIds: ["composition", "portfolio", "interface", "domain"],
    relationIds: ["composition-portfolio", "interface-application", "application-domain"],
    tradeOffIds: ["url-state"],
    steps: [
      "De interface zet keywords in de query en laat de scroll staan.",
      "De server leest de query en bouwt het read-model opnieuw.",
      "parseKeywords splitst, effectiveSelection laat onbekende woorden vallen.",
      "filterProjects houdt een project als één trefwoord overlapt. Meerdere woorden zijn een OF.",
    ],
  },
  {
    id: "visitor-question",
    title: "Een bezoeker vraagt",
    question: "Hoe komt een chatantwoord tot stand?",
    summary: "Tempo, zegel, zoeken, en pas dan het model. De sleutel blijft op de server.",
    nodeIds: ["composition", "assistant", "infrastructure", "domain"],
    relationIds: ["composition-assistant", "infrastructure-application", "infrastructure-domain", "application-domain"],
    tradeOffIds: ["retrieval", "sealed-transcript"],
    steps: [
      "De browser stuurt het gesprek naar /api/chat.",
      "Een beurt van de assistent telt alleen als het zegel klopt.",
      "Het tempo weigert vóór het model als het plafond vol is.",
      "searchProfile haalt fragmenten op. Het model mag alleen die fragmenten gebruiken.",
    ],
  },
  {
    id: "dependency-rule",
    title: "De lagen wijzen naar binnen",
    question: "Waarom mag een scherm de adapter niet importeren?",
    summary: "Een import die de verkeerde kant op wijst, faalt in pnpm test. De regel is geen afspraak op papier.",
    nodeIds: ["kernel", "interface", "application", "domain", "infrastructure"],
    relationIds: ["interface-application", "application-domain", "infrastructure-domain", "infrastructure-application", "interface-infrastructure", "portfolio-assistant"],
    tradeOffIds: ["two-contexts", "modular-monolith"],
    steps: [
      "interface mag application en domain. Niet infrastructure.",
      "application mag domain. Niet React, Next, of een SDK.",
      "infrastructure implementeert de poort en vertaalt JSON.",
      "Twee contexten importeren elkaars taal niet. De compositie bedraadt beide facades.",
    ],
  },
  {
    id: "scalable-assistant",
    title: "Schalen zonder vrije code",
    question: "Hoe groeit de AI-laag mee zonder een tweede product te worden?",
    summary: "Eerst de goedkope, lokale stappen. Het model kiest uit een vaste vorm. Een aparte service is een latere grens, geen begin.",
    nodeIds: ["composition", "assistant", "domain", "infrastructure"],
    relationIds: ["composition-assistant", "application-domain", "infrastructure-application", "infrastructure-domain"],
    tradeOffIds: ["modular-monolith", "structured-guidance", "retrieval"],
    steps: [
      "De catalogus beantwoordt een bekende vraag zonder het model aan te roepen.",
      "Ontbreekt de sleutel, dan blijft die catalogus het antwoord. Het scherm zegt dat.",
      "Is er een model, dan levert het alleen surface, focus en één zin.",
      "De pagina tekent een onderdeel dat al bestond. Ze evalueert geen tekst als code.",
    ],
  },
];

export function architectureAtlas(): ArchitectureAtlas {
  const atlas = { nodes, relations, tradeOffs, scenarios };
  assertAtlas(atlas);
  return atlas;
}

export function knownScenario(value: unknown): ArchitectureScenarioId | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") {
    return null;
  }
  return (ARCHITECTURE_SCENARIO_IDS as readonly string[]).includes(raw) ? (raw as ArchitectureScenarioId) : null;
}

export function presentAtlas(
  atlas: ArchitectureAtlas,
  scenarioId: string | null,
  selectedId: string | null,
): AtlasPresentation {
  const scenario = atlas.scenarios.find((item) => item.id === scenarioId) ?? null;
  const activeNodes = scenario ? new Set(scenario.nodeIds) : null;
  const activeRelations = scenario ? new Set(scenario.relationIds) : null;
  const selected =
    atlas.nodes.find((node) => node.id === selectedId) ??
    atlas.nodes.find((node) => node.id === scenario?.nodeIds[0]) ??
    atlas.nodes[0] ??
    null;

  return {
    scenario,
    nodes: atlas.nodes.map((node) => ({
      ...node,
      dimmed: activeNodes ? !activeNodes.has(node.id) : false,
      selected: node.id === selected?.id,
    })),
    relations: atlas.relations.map((relation) => ({
      ...relation,
      dimmed: activeRelations ? !activeRelations.has(relation.id) : relation.kind === "forbids",
    })),
    tradeOffs: scenario
      ? scenario.tradeOffIds.flatMap((id) => {
          const tradeOff = atlas.tradeOffs.find((item) => item.id === id);
          return tradeOff ? [tradeOff] : [];
        })
      : [],
    selected,
  };
}

function assertAtlas(atlas: ArchitectureAtlas): void {
  const nodeIds = new Set<string>();
  const positions = new Set<string>();
  for (const node of atlas.nodes) {
    if (nodeIds.has(node.id)) {
      throw new Error(`Dubbel onderdeel: ${node.id}`);
    }
    nodeIds.add(node.id);
    if (node.column < 0 || node.row < 0) {
      throw new Error(`Ongeldige plek: ${node.id}`);
    }
    const position = `${node.column}:${node.row}`;
    if (positions.has(position)) {
      throw new Error(`Onderdelen delen een plek: ${position}`);
    }
    positions.add(position);
  }

  const relationIds = new Set<string>();
  for (const relation of atlas.relations) {
    if (relationIds.has(relation.id) || !nodeIds.has(relation.from) || !nodeIds.has(relation.to)) {
      throw new Error(`Ongeldige relatie: ${relation.id}`);
    }
    relationIds.add(relation.id);
  }

  const tradeOffIds = new Set(atlas.tradeOffs.map((item) => item.id));
  if (tradeOffIds.size !== atlas.tradeOffs.length) {
    throw new Error("Dubbele afweging.");
  }

  const scenarioIds = atlas.scenarios.map((scenario) => scenario.id);
  if (scenarioIds.join("|") !== ARCHITECTURE_SCENARIO_IDS.join("|")) {
    throw new Error("De scenario-ids wijken af van de vaste lijst.");
  }

  for (const scenario of atlas.scenarios) {
    if (scenario.nodeIds.length === 0 || scenario.steps.length === 0 || scenario.tradeOffIds.length === 0) {
      throw new Error(`Leeg scenario: ${scenario.id}`);
    }
    for (const id of scenario.nodeIds) {
      if (!nodeIds.has(id)) {
        throw new Error(`Scenario ${scenario.id} noemt een onbekend onderdeel ${id}`);
      }
    }
    for (const id of scenario.relationIds) {
      if (!relationIds.has(id)) {
        throw new Error(`Scenario ${scenario.id} noemt een onbekende relatie ${id}`);
      }
    }
    for (const id of scenario.tradeOffIds) {
      if (!tradeOffIds.has(id)) {
        throw new Error(`Scenario ${scenario.id} noemt een onbekende afweging ${id}`);
      }
    }
  }
}
