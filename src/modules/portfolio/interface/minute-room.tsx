import type { TradeOff } from "../domain/architecture-atlas";
import type { PersonalProfile, Project } from "../domain/model";
import { MINUTE_BEATS, minuteCopy, minuteNeighbour, type MinuteBeat, type MinuteFacts } from "../domain/minute";
import { paragraphs } from "../domain/prose";
import { VCard } from "./v-card";

export function MinuteRoom({
  beat,
  facts,
  project,
  tradeOff,
  profile,
  yearsAsDeveloper,
  skillCount,
  onBeat,
  onLeave,
  onProjects,
}: {
  beat: MinuteBeat;
  facts: MinuteFacts;
  project: Project | null;
  tradeOff: TradeOff;
  profile: PersonalProfile;
  yearsAsDeveloper: number;
  skillCount: number;
  onBeat: (beat: MinuteBeat) => void;
  onLeave: () => void;
  onProjects: () => void;
}) {
  const copy = minuteCopy(beat, facts);
  const previous = minuteNeighbour(beat, -1);
  const next = minuteNeighbour(beat, 1);

  return (
    <section id="minuut" className="outline-none" tabIndex={-1} aria-labelledby="minute-title" data-boundary="minuut">
      <div className="mx-auto max-w-5xl px-4 pt-8 pb-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <ol className="flex flex-wrap gap-2" aria-label="Stappen van de minuut">
          {MINUTE_BEATS.map((id, index) => (
            <li key={id}>
              <button
                type="button"
                aria-current={id === beat ? "step" : undefined}
                className={`px-3 py-1.5 font-ui text-sm ${
                  id === beat ? "bg-primary text-white" : "bg-white text-ink ring-1 ring-black/10 hover:ring-primary/40"
                }`}
                onClick={() => onBeat(id)}
              >
                {index + 1}. {minuteCopy(id, facts).kicker}
              </button>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="px-3 py-2 text-sm text-ink underline decoration-primary/40 underline-offset-4 disabled:opacity-40"
            disabled={previous === null}
            onClick={() => previous && onBeat(previous)}
          >
            Vorige
          </button>
          {next ? (
            <button type="button" className="bg-primary px-4 py-2.5 font-medium text-white shadow-material hover:bg-primary-dark" onClick={() => onBeat(next)}>
              Volgende
            </button>
          ) : (
            <button type="button" className="bg-primary px-4 py-2.5 font-medium text-white shadow-material hover:bg-primary-dark" onClick={onLeave}>
              Hele pagina
            </button>
          )}
          <button type="button" className="px-3 py-2 text-sm text-ink underline decoration-primary/40 underline-offset-4" onClick={onLeave}>
            Zelf kijken
          </button>
        </div>
        </div>
        <p className="mt-6 font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">{copy.kicker}</p>
        <h2 id="minute-title" className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
          {copy.title}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted" aria-live="polite">
          {copy.line}
        </p>
        <div className="mt-8">
          {beat === "wie" ? (
            <VCard
              profile={profile}
              yearsAsDeveloper={yearsAsDeveloper}
              projectCount={facts.projects}
              skillCount={skillCount}
              framed
            />
          ) : null}
          {beat === "bewijs" ? <Proof project={project} onProjects={onProjects} /> : null}
          {beat === "oordeel" ? <Judgment tradeOff={tradeOff} /> : null}
          {beat === "deur" ? <Door profile={profile} /> : null}
        </div>
      </div>
    </section>
  );
}

function Proof({ project, onProjects }: { project: Project | null; onProjects: () => void }) {
  if (!project) {
    return <p className="text-muted">Er staan geen projecten op deze pagina.</p>;
  }

  return (
    <article className="bg-white p-6 shadow-card sm:p-8">
      <p className="font-ui text-xs font-medium tracking-[0.16em] text-primary uppercase">{project.company}</p>
      <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{project.title}</h3>
      {paragraphs(project.shortDescription).map((paragraph) => (
        <p key={paragraph} className="mt-4 text-lg text-ink">
          {paragraph}
        </p>
      ))}
      <ul className="mt-5 flex flex-wrap gap-2">
        {project.keywords.map((keyword) => (
          <li key={keyword} className="bg-paper px-3 py-1 font-ui text-sm text-ink">
            {keyword}
          </li>
        ))}
      </ul>
      <button type="button" className="mt-6 text-sm text-ink underline decoration-primary/40 underline-offset-4" onClick={onProjects}>
        Alle projecten
      </button>
    </article>
  );
}

function Judgment({ tradeOff }: { tradeOff: TradeOff }) {
  return (
    <article className="bg-white p-6 shadow-card sm:p-8">
      <p className="font-ui text-xs font-medium tracking-[0.16em] text-primary uppercase">Afweging</p>
      <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{tradeOff.title}</h3>
      <p className="mt-4 text-ink">{tradeOff.choice}</p>
      <p className="mt-3 text-muted">{tradeOff.gain}</p>
      <p className="mt-3 text-muted">{tradeOff.cost}</p>
      <p className="mt-3 text-ink">{tradeOff.alternative}</p>
    </article>
  );
}

function Door({ profile }: { profile: PersonalProfile }) {
  return (
    <div className="bg-white p-6 shadow-card sm:p-8">
      <a className="inline-flex bg-primary px-4 py-2.5 font-medium text-white no-underline shadow-material hover:bg-primary-dark" href={`mailto:${profile.email}`}>
        {profile.email}
      </a>
      <ul className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:gap-6">
        <li>
          <a className="text-ink underline decoration-primary/40 underline-offset-4 hover:text-primary" href={profile.linkedIn} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </li>
        <li>
          <a className="text-ink underline decoration-primary/40 underline-offset-4 hover:text-primary" href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a className="text-ink underline decoration-primary/40 underline-offset-4 hover:text-primary" href="#contact">
            Contact onderaan
          </a>
        </li>
      </ul>
    </div>
  );
}
