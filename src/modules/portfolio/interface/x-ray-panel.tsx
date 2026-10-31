const BOUNDARY_LABELS: Record<string, string> = {
  kop: "Kop van de pagina",
  identiteit: "Profiel",
  verkenning: "Ingangen",
  werkruimte: "Werkruimte",
  architectuur: "Architectuurkaart",
  opdracht: "Ontwerpopdracht",
  experimenten: "Experimenten",
  werk: "Werklijst",
  commando: "Commandoregel",
  chat: "Chat",
  voet: "Voet",
};

export function XRayPanel({
  transitions,
  requests,
  boundaries,
  onClose,
}: {
  transitions: { id: string; detail: string }[];
  requests: { id: string; detail: string }[];
  boundaries: string[];
  onClose: () => void;
}) {
  return (
    <aside
      className="fixed top-28 right-4 z-40 max-h-[calc(100dvh-9rem)] w-[min(22rem,calc(100%-2rem))] overflow-y-auto bg-white p-5 shadow-card ring-1 ring-black/5"
      aria-labelledby="xray-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Röntgen</p>
          <h2 id="xray-title" className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
            Gemeten
          </h2>
        </div>
        <button type="button" className="text-sm text-ink underline decoration-primary/40 underline-offset-4" onClick={onClose}>
          Sluiten
        </button>
      </div>
      <section className="mt-5" aria-labelledby="xray-boundaries">
        <h3 id="xray-boundaries" className="font-ui text-xs font-medium tracking-[0.16em] text-muted uppercase">
          Grenzen in de pagina
        </h3>
        {boundaries.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Geen data-boundary gevonden.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {boundaries.map((name) => (
              <li key={name}>{BOUNDARY_LABELS[name] ?? name}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-5" aria-labelledby="xray-transitions">
        <h3 id="xray-transitions" className="font-ui text-xs font-medium tracking-[0.16em] text-muted uppercase">
          Overgangen
        </h3>
        {transitions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nog geen wissel van werkruimte in dit bezoek.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {transitions.map((entry) => (
              <li key={entry.id}>{entry.detail}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-5" aria-labelledby="xray-requests">
        <h3 id="xray-requests" className="font-ui text-xs font-medium tracking-[0.16em] text-muted uppercase">
          Verzoeken
        </h3>
        {requests.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nog geen /api-verzoek in de resource timing.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {requests.map((entry) => (
              <li key={entry.id}>{entry.detail}</li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-5 text-sm text-muted">
        <span className="font-ui text-xs font-medium tracking-[0.16em] text-primary uppercase">Toelichting. </span>
        De stippellijn tekent elementen met data-boundary. Duur en status komen uit de resource timing van deze browser. Er gaat geen sleutel mee.
      </p>
    </aside>
  );
}
