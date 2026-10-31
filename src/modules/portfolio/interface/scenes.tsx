import type { ReactNode } from "react";
import type { ArchitectureScenarioId } from "../domain/architecture-atlas";
import type { Curiosity } from "../domain/curiosity";
import type { PortfolioPage } from "../application/compose-portfolio-page";
import { ArchitecturePlayground } from "./architecture-playground";
import { ChallengePanel } from "./challenge-panel";
import { WorkExplorer } from "./work-explorer";

export type SceneContext = {
  model: PortfolioPage;
  focus: ArchitectureScenarioId | null;
  note: string | null;
  origin: "catalog" | "model" | null;
  studyBench?: ReactNode;
  onScenario: (id: ArchitectureScenarioId | null) => void;
};

export const sceneRegistry: {
  [Key in Exclude<Curiosity, "portrait">]: (props: SceneContext) => ReactNode;
} = {
  work: WorkScene,
  thinking: ThinkingScene,
  experiments: ExperimentsScene,
  challenge: ChallengeScene,
};

function WorkScene({ model, note, origin }: SceneContext) {
  return (
    <div>
      <GuideNote note={note} origin={origin} />
      <section id="werk" aria-labelledby="work-title" data-boundary="werk">
        <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Werk</p>
        <h2 id="work-title" className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
          Werkervaring
        </h2>
        <p className="mt-4 max-w-2xl text-muted">De selectie blijft in het adres. Meerdere trefwoorden zijn een OF-filter.</p>
        <div className="mt-8">
          <WorkExplorer projects={model.allProjects} initialSelected={model.selectedKeywords} lens="work" />
        </div>
      </section>
    </div>
  );
}

function ThinkingScene({ note, origin, focus, onScenario }: SceneContext) {
  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-labelledby="thinking-title">
      <GuideNote note={note} origin={origin} />
      <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Architectuur</p>
      <h2 id="thinking-title" className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
        Hoe deze applicatie in elkaar zit
      </h2>
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <ArchitecturePlayground scenarioId={focus} onScenario={onScenario} />
      </div>
    </section>
  );
}

function ExperimentsScene({ note, origin, studyBench }: SceneContext) {
  return (
    <section aria-labelledby="experiments-title" data-boundary="experimenten">
      <GuideNote note={note} origin={origin} />
      <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Experimenten</p>
      <h2 id="experiments-title" className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
        Wat de assistent echt doet
      </h2>
      <p className="mt-4 max-w-2xl text-muted">
        Zoeken in het profiel, een zegel dat breekt, het tempo, en een antwoord dat alleen een bekende werkruimte mag openen.
      </p>
      <div className="mt-8">{studyBench}</div>
    </section>
  );
}

function ChallengeScene({ note, origin }: SceneContext) {
  return (
    <div>
      <GuideNote note={note} origin={origin} />
      <ChallengePanel />
    </div>
  );
}

function GuideNote({ note, origin }: { note: string | null; origin: "catalog" | "model" | null }) {
  if (!note) {
    return null;
  }

  return (
    <aside className="mb-8 bg-white p-6 shadow-card" aria-live="polite">
      <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">
        {origin === "model" ? "Model" : "Verkenning"}
      </p>
      <p className="mt-3 text-lg text-ink">{note}</p>
      <p className="mt-3 text-sm text-muted">
        {origin === "model"
          ? "De vorm is gecontroleerd. De zin komt van het model. Er wordt geen code uitgevoerd."
          : "Vooraf bepaalde verkenning. Het model is hier niet aangeroepen."}
      </p>
    </aside>
  );
}
