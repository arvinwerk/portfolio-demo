import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  architectureAtlas,
  presentAtlas,
  type ArchitectureScenarioId,
} from "../domain/architecture-atlas";

const ArchitectureCanvas = dynamic(
  () => import("./architecture-canvas").then((mod) => mod.ArchitectureCanvas),
  {
    ssr: false,
    loading: () => <p className="bg-paper px-4 py-8 text-sm text-muted">De kaart wordt geladen.</p>,
  },
);

export function ArchitecturePlayground({
  scenarioId,
  onScenario,
}: {
  scenarioId: ArchitectureScenarioId | null;
  onScenario: (id: ArchitectureScenarioId | null) => void;
}) {
  const atlas = useMemo(() => architectureAtlas(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const presentation = presentAtlas(atlas, scenarioId, selectedId);
  const selected = presentation.selected;

  return (
    <div
      data-boundary="architectuur"
      className="atlas-board grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.7fr)]"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Scenario's">
          <button
            type="button"
            aria-pressed={scenarioId === null}
            className={chip(scenarioId === null)}
            onClick={() => {
              setSelectedId(null);
              onScenario(null);
            }}
          >
            Overzicht
          </button>
          {atlas.scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              aria-pressed={scenario.id === scenarioId}
              className={chip(scenario.id === scenarioId)}
              onClick={() => {
                setSelectedId(null);
                onScenario(scenario.id);
              }}
            >
              {scenario.title}
            </button>
          ))}
        </div>
        <div className="atlas-frame mt-3 overflow-hidden bg-white shadow-card ring-1 ring-black/5">
          <ArchitectureCanvas presentation={presentation} onSelect={setSelectedId} />
        </div>
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Onderdelen">
          {presentation.nodes.map((node) => (
            <li key={node.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={node.selected}
                className={`shrink-0 px-3 py-1.5 text-sm whitespace-nowrap ${
                  node.selected ? "bg-primary text-white" : "bg-white text-ink ring-1 ring-black/10"
                } ${node.dimmed ? "opacity-50" : ""}`}
                onClick={() => setSelectedId(node.id)}
              >
                {node.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <aside className="min-h-0 overflow-y-auto bg-white p-6 shadow-card sm:p-8 lg:max-h-full" aria-live="polite">
        {presentation.scenario ? (
          <>
            <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Scenario</p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">{presentation.scenario.title}</h3>
            <p className="mt-3 text-muted">{presentation.scenario.summary}</p>
            <ol className="mt-5 space-y-3 border-l border-primary/30 pl-4">
              {presentation.scenario.steps.map((step) => (
                <li key={step} className="text-sm text-ink">
                  {step}
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Kaart</p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">De applicatie zelf</h3>
            <p className="mt-3 text-muted">
              Sleep een onderdeel, zoom, of kies een scenario. Een stippellijn is een import die niet mag.
            </p>
          </>
        )}
        {selected ? (
          <div className="mt-6 border-t border-black/10 pt-6">
            <p className="font-ui text-xs font-medium tracking-[0.16em] text-primary uppercase">{selected.kicker}</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-ink">{selected.title}</h3>
            <p className="mt-3 text-ink">{selected.summary}</p>
            <p className="mt-3 text-muted">{selected.detail}</p>
            {selected.excerpt ? (
              <pre className="mt-4 overflow-x-auto bg-paper p-4 font-ui text-xs leading-relaxed text-ink">{selected.excerpt}</pre>
            ) : null}
          </div>
        ) : null}
        {presentation.tradeOffs.length > 0 ? (
          <div className="mt-6 space-y-5 border-t border-black/10 pt-6">
            {presentation.tradeOffs.map((tradeOff) => (
              <article key={tradeOff.id}>
                <h3 className="font-display text-lg font-semibold text-ink">{tradeOff.title}</h3>
                <p className="mt-2 text-sm text-ink">{tradeOff.choice}</p>
                <p className="mt-2 text-sm text-muted">{tradeOff.gain}</p>
                <p className="mt-2 text-sm text-muted">{tradeOff.cost}</p>
                <p className="mt-2 text-sm text-ink">{tradeOff.alternative}</p>
              </article>
            ))}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function chip(selected: boolean): string {
  return `shrink-0 rounded-full px-4 py-2 font-ui text-sm whitespace-nowrap ${
    selected ? "bg-primary text-white" : "bg-white text-ink ring-1 ring-black/10 hover:ring-primary/40"
  }`;
}
