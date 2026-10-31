export type ChallengeOption = {
  id: string;
  label: string;
  consequence: string;
  builtThisWay: boolean;
};

export type ChallengeStep = {
  id: string;
  prompt: string;
  options: ChallengeOption[];
};

export type DesignChallenge = {
  id: string;
  title: string;
  brief: string;
  steps: ChallengeStep[];
};

export type ChoiceAssessment = {
  stepId: string;
  optionId: string;
  label: string;
  consequence: string;
  builtThisWay: boolean;
};

const challenge: DesignChallenge = {
  id: "scalable-ai",
  title: "Een AI-laag die meegroeit",
  brief:
    "Meer bezoekers stellen meer vragen. Het model mag feiten over de persoon niet verzinnen, en het mag de pagina geen code laten uitvoeren. Kies per stap. Je ziet de prijs, en of deze pagina die keuze ook maakt.",
  steps: [
    {
      id: "where",
      prompt: "Waar draait het model?",
      options: [
        {
          id: "browser",
          label: "In de browser, met de sleutel ernaast",
          consequence: "Iedere bezoeker kan de sleutel lezen. Een plafond op de server komt dan te laat.",
          builtThisWay: false,
        },
        {
          id: "route",
          label: "Een route in dezelfde applicatie",
          consequence: "Eén deploy. De sleutel blijft op de server. De browser ziet alleen /api/chat en /api/guide.",
          builtThisWay: true,
        },
        {
          id: "service",
          label: "Een aparte modelservice",
          consequence: "Die schaalt los van de pagina, en kost CORS, een tweede geheim en een tweede release.",
          builtThisWay: false,
        },
      ],
    },
    {
      id: "shape",
      prompt: "Wat mag een antwoord veranderen aan het scherm?",
      options: [
        {
          id: "prose",
          label: "Alleen een chattekst",
          consequence: "Veilig en smal. De rest van de pagina blijft stilstaan, ook als een kaart het betere antwoord was.",
          builtThisWay: false,
        },
        {
          id: "registry",
          label: "Een werkruimte uit een vaste lijst, plus één zin",
          consequence: "De pagina opent een onderdeel dat al bestond. De zin wordt gecontroleerd op lengte en vorm.",
          builtThisWay: true,
        },
        {
          id: "code",
          label: "Componentcode die de browser uitvoert",
          consequence: "Het scherm wordt zo vrij als de tekst. Onbetrouwbare invoer wordt dan een programma.",
          builtThisWay: false,
        },
      ],
    },
    {
      id: "facts",
      prompt: "Hoe komt het model aan een feit over de persoon?",
      options: [
        {
          id: "prompt",
          label: "Het hele profiel staat in de systeemprompt",
          consequence: "Elk verzoek sleept het corpus mee. Een wijziging in de tekst is pas zichtbaar als de prompt mee verandert.",
          builtThisWay: false,
        },
        {
          id: "retrieve",
          label: "Eerst zoeken, en alleen die fragmenten meesturen",
          consequence: "searchProfile rangschikt content/rag met BM25. Vindt de tool niets, dan hoort het antwoord dat te zeggen.",
          builtThisWay: true,
        },
        {
          id: "memory",
          label: "Het model onthoudt het cv zelf",
          consequence: "Geen index om te testen. Een verzonnen project is niet te onderscheiden van een gevonden project.",
          builtThisWay: false,
        },
      ],
    },
    {
      id: "transcript",
      prompt: "Wie mag een eerdere assistentbeurt aanpassen?",
      options: [
        {
          id: "client",
          label: "De browser. Die geschiedenis telt",
          consequence: "De bezoeker kan een antwoord of een toolresultaat toevoegen. Het model volgt die tekst.",
          builtThisWay: false,
        },
        {
          id: "seal",
          label: "Alleen een beurt met een geldig zegel",
          consequence: "HMAC met de serversleutel. De vaste welkomstzin is de enige uitzondering. Een andere sleutel veegt de oude geschiedenis weg.",
          builtThisWay: true,
        },
      ],
    },
  ],
};

export function designChallenge(): DesignChallenge {
  assertChallenge(challenge);
  return challenge;
}

export function assessChoice(task: DesignChallenge, stepId: string, optionId: string): ChoiceAssessment | null {
  const step = task.steps.find((item) => item.id === stepId);
  const option = step?.options.find((item) => item.id === optionId);
  if (!step || !option) {
    return null;
  }

  return {
    stepId: step.id,
    optionId: option.id,
    label: option.label,
    consequence: option.consequence,
    builtThisWay: option.builtThisWay,
  };
}

function assertChallenge(task: DesignChallenge): void {
  const stepIds = new Set<string>();
  for (const step of task.steps) {
    if (stepIds.has(step.id) || step.options.length < 2) {
      throw new Error(`Ongeldige stap: ${step.id}`);
    }
    stepIds.add(step.id);
    const built = step.options.filter((option) => option.builtThisWay);
    if (built.length !== 1) {
      throw new Error(`Stap ${step.id} hoort één keuze van deze pagina te hebben.`);
    }
    const optionIds = new Set(step.options.map((option) => option.id));
    if (optionIds.size !== step.options.length) {
      throw new Error(`Dubbele keuze in ${step.id}`);
    }
  }
}
