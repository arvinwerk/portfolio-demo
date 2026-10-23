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
    <section className="about" aria-labelledby="about-title">
      <h2 id="about-title" className="sr-only">
        Over
      </h2>
      <div className="about__prose">
        {foreword.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="about__action">
        <div>
          {githubDescription.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <a className="button" href={github} target="_blank" rel="noreferrer">
          Code
        </a>
      </div>
    </section>
  );
}
