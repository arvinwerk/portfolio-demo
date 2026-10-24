export function About({
  foreword,
  github,
  githubDescription,
}: {
  foreword: string[];
  github: string;
  githubDescription: string[];
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20" id="over" aria-labelledby="about-title">
      <h2 id="about-title" className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">
        Over
      </h2>
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.75fr)]">
        <div className="space-y-5">
          {foreword.map((paragraph, index) => (
            <p key={paragraph} className={index === 0 ? "font-display text-2xl leading-snug text-ink sm:text-3xl" : "text-lg text-muted"}>
              {paragraph}
            </p>
          ))}
        </div>
        <aside className="bg-white p-6 shadow-card sm:p-8">
          <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Broncode</p>
          <div className="mt-4 space-y-3">
            {githubDescription.map((paragraph) => (
              <p key={paragraph} className="text-ink">
                {paragraph}
              </p>
            ))}
          </div>
          <a
            className="mt-6 inline-block bg-action px-4 py-2.5 font-ui text-sm font-medium tracking-wide text-white uppercase no-underline hover:brightness-110"
            href={github}
            target="_blank"
            rel="noreferrer"
          >
            Code
          </a>
        </aside>
      </div>
    </section>
  );
}
