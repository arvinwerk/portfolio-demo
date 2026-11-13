import type { AgentsPage } from "../application/compose-agents-page";

export function AgentsView({ model, siteName }: { model: AgentsPage; siteName: string }) {
  return (
    <>
      <div id="top" className="h-0" />
      <header className="sticky top-0 z-30 border-b border-black/5 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <a className="font-display text-lg font-semibold tracking-tight text-primary no-underline" href="/">
            {siteName}
          </a>
          <nav className="flex items-center gap-4 text-sm sm:gap-6" aria-label="Agents">
            <a className="text-ink no-underline hover:text-primary" href="/">
              Portfolio
            </a>
          </nav>
        </div>
      </header>
      <main id="inhoud" className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Agents</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">Dagelijkse voorstellen</h1>
        <p className="mt-4 max-w-3xl text-muted">
          Elke dag kijken drie agents naar deze site en naar de code: gebruik, content en vindbaarheid. Ze lezen eerst
          de oudere rapporten.
        </p>
        {model.days.length === 0 ? (
          <p className="mt-10 text-ink">Nog geen voorstel.</p>
        ) : (
          <div className="mt-12 flex flex-col gap-14">
            {model.days.map((day) => (
              <section key={day.date} aria-labelledby={`dag-${day.date}`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 id={`dag-${day.date}`} className="font-display text-3xl font-semibold tracking-tight text-ink">
                    {dutchDate(day.date)}
                  </h2>
                  {day.averageScore !== null ? (
                    <p className="font-ui text-sm text-muted">Gemiddeld {formatScore(day.averageScore)}</p>
                  ) : null}
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  {day.reports.map((report) => (
                    <article key={`${day.date}-${report.lens}`} className="bg-white p-6 shadow-material">
                      <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">{report.title}</h3>
                      {report.score === null ? (
                        <p className="mt-3 text-sm text-muted">Geen score</p>
                      ) : (
                        <p className="mt-3 font-display text-5xl font-semibold tracking-tight text-primary" aria-label={`Score ${report.score} van 10`}>
                          {report.score}
                          <span className="text-2xl text-muted">/10</span>
                        </p>
                      )}
                      {report.suggestions.length > 0 ? (
                        <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-ink">
                          {report.suggestions.map((suggestion, index) => (
                            <li key={`${report.lens}-${index}`}>{suggestion}</li>
                          ))}
                        </ul>
                      ) : null}
                      {report.paragraphs.length > 0 ? (
                        <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
                          {report.paragraphs.map((paragraph, index) => (
                            <p key={`${report.lens}-paragraph-${index}`}>{paragraph}</p>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function formatScore(score: number): string {
  const text = Number.isInteger(score) ? String(score) : score.toFixed(1).replace(".", ",");
  return `${text}/10`;
}

function dutchDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
