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
    <section className="mx-auto mt-8 max-w-[1000px] px-4" aria-labelledby="about-title">
      <h2 id="about-title" className="sr-only">
        Over
      </h2>
      <div className="bg-white shadow-card">
        <div className="space-y-5 px-6 py-8 text-left sm:px-10 sm:py-10">
          {foreword.map((paragraph) => (
            <p key={paragraph} className="m-0 text-ink">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="flex flex-col items-start gap-4 border-t border-[#ededed] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="space-y-2">
            {githubDescription.map((paragraph) => (
              <p key={paragraph} className="m-0 text-ink">
                {paragraph}
              </p>
            ))}
          </div>
          <a
            className="inline-block shrink-0 bg-action px-4 py-2 font-ui text-sm font-medium tracking-wide text-white uppercase no-underline shadow-material hover:brightness-110"
            href={github}
            target="_blank"
            rel="noreferrer"
          >
            Code
          </a>
        </div>
      </div>
    </section>
  );
}
