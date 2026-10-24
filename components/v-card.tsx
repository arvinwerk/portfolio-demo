import { displayUrl } from "@/lib/text";
import type { Personal } from "@/lib/types";

export function VCard({
  personal,
  yearsAsDeveloper,
  projectCount,
  skillCount,
}: {
  personal: Personal;
  yearsAsDeveloper?: number;
  projectCount?: number;
  skillCount?: number;
}) {
  const showFacts = yearsAsDeveloper != null && projectCount != null && skillCount != null;

  return (
    <section className="px-4 pt-10 pb-6 sm:pt-14 sm:pb-10" aria-label="Profiel">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)] md:gap-16">
        <div>
          <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">{personal.function}</p>
          <h1 className="mt-3 font-display text-[3.1rem] leading-[0.92] font-semibold tracking-tight text-ink sm:text-7xl">
            {personal.fullName}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            {personal.education}
            <span aria-hidden="true"> · </span>
            <span>{personal.location}</span>
          </p>
          {showFacts ? (
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3 border-y border-black/10 py-5">
              <Fact value={yearsAsDeveloper} label="jaar ontwikkeling" />
              <Fact value={projectCount} label={projectCount === 1 ? "project" : "projecten"} />
              <Fact value={skillCount} label={skillCount === 1 ? "vaardigheid" : "vaardigheden"} />
            </dl>
          ) : null}
          <ul className="mt-8 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center">
            <li>
              <a
                className="inline-flex bg-primary px-4 py-2.5 font-medium text-white no-underline shadow-material hover:bg-primary-dark"
                href={`mailto:${personal.email}`}
              >
                {personal.email}
              </a>
            </li>
            <li>
              <a className="text-ink underline decoration-primary/40 underline-offset-4 hover:text-primary" href={personal.linkedIn} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a className="text-ink underline decoration-primary/40 underline-offset-4 hover:text-primary" href={personal.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a className="text-ink underline decoration-primary/40 underline-offset-4 hover:text-primary" href={personal.portfolioUrl}>
                {displayUrl(personal.portfolioUrl)}
              </a>
            </li>
          </ul>
        </div>
        <figure className="relative mx-auto w-full max-w-sm md:mx-0 md:justify-self-end">
          <div className="absolute top-4 left-4 h-full w-full bg-primary" aria-hidden="true" />
          <img
            className="relative aspect-[4/5] w-full object-cover"
            src="/images/profile.svg"
            alt={`Monogram van ${personal.fullName}`}
            width={640}
            height={800}
          />
        </figure>
      </div>
    </section>
  );
}

function Fact({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="font-display text-3xl leading-none font-semibold tracking-tight text-ink">{value}</dt>
      <dd className="mt-2 text-xs leading-snug text-muted">{label}</dd>
    </div>
  );
}
