import type { Curiosity } from "../domain/curiosity";

const ENTRIES: { id: Exclude<Curiosity, "portrait">; title: string; copy: string }[] = [
  {
    id: "work",
    title: "Mijn werk",
    copy: "Projecten, trefwoorden en wat er in de lijst blijft staan.",
  },
  {
    id: "thinking",
    title: "Hoe ik denk",
    copy: "Grenzen, afwegingen en de kaart van deze applicatie.",
  },
  {
    id: "experiments",
    title: "AI-experimenten",
    copy: "Zoeken, zegel, tempo en een antwoord met een vaste vorm.",
  },
  {
    id: "challenge",
    title: "Daag me uit",
    copy: "Ontwerp een AI-laag en zie de prijs van elke keuze.",
  },
];

export function CuriosityBand({
  current,
  onSelect,
  onPortrait,
  variant,
}: {
  current: Curiosity;
  onSelect: (lens: Exclude<Curiosity, "portrait">) => void;
  onPortrait?: () => void;
  variant: "stage" | "rail";
}) {
  if (variant === "rail") {
    return (
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Verkenning" data-boundary="verkenning">
        {ENTRIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={current === entry.id}
            className={`rounded-full px-4 py-2 font-ui text-sm ${
              current === entry.id ? "bg-primary text-white" : "bg-white text-ink ring-1 ring-black/10 hover:ring-primary/40"
            }`}
            onClick={() => onSelect(entry.id)}
          >
            {entry.title}
          </button>
        ))}
        {onPortrait ? (
          <button
            type="button"
            className="px-3 py-2 text-sm text-ink underline decoration-primary/40 underline-offset-4"
            onClick={onPortrait}
          >
            Hele pagina
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:pt-10" aria-labelledby="curiosity-title" data-boundary="verkenning">
      <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Verkennen</p>
      <h2 id="curiosity-title" className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
        Waar ben je nieuwsgierig naar?
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Kies een ingang. De pagina houdt dezelfde vorm en wordt een werkruimte.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2" role="group" aria-label="Ingangen">
        {ENTRIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={current === entry.id}
            className="group bg-white p-6 text-left shadow-card ring-1 ring-transparent motion-safe:transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:ring-primary/30"
            onClick={() => onSelect(entry.id)}
          >
            <span className="font-display text-2xl font-semibold tracking-tight text-ink group-hover:text-primary">{entry.title}</span>
            <span className="mt-3 block text-muted">{entry.copy}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
