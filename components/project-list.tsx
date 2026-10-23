import type { KeywordLink, Project } from "@/lib/types";
import { paragraphs } from "@/lib/text";

export function ProjectList({
  projects,
  links,
  onSelect,
}: {
  projects: Project[];
  links: KeywordLink[];
  onSelect: (key: string) => void;
}) {
  if (projects.length === 0) {
    return <p className="mt-6 text-muted">Geen projecten voor deze selectie.</p>;
  }

  const hrefFor = (keyword: string) => links.find((link) => link.key === keyword);

  return (
    <ol className="relative mt-8">
      <div className="absolute top-0 bottom-6 left-1/2 hidden w-1 -translate-x-1/2 bg-primary/40 md:block" aria-hidden="true" />
      {projects.map((project, index) => {
        const onRight = index % 2 === 1;
        return (
          <li key={project.id} className="relative mb-8 md:mb-16">
            <span className="absolute top-1 right-0 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-white shadow-material md:top-0 md:right-auto md:left-1/2 md:-translate-x-1/2">
              {String(project.id).padStart(2, "0")}
            </span>
            <article
              className={`relative z-[1] border-l-[5px] border-accent bg-white p-5 pr-16 shadow-card md:w-[44%] md:pr-5 ${
                onRight ? "md:ml-auto" : ""
              }`}
            >
              <span
                className={`absolute top-[22px] hidden h-1 w-14 bg-primary/40 md:block ${onRight ? "right-full" : "left-full"}`}
                aria-hidden="true"
              />
              <h3 className="max-w-[84%] font-display text-xl font-normal text-ink md:max-w-none">{project.title}</h3>
              <p className="mt-1 text-sm text-ink">{project.company}</p>
              {paragraphs(project.shortDescription).map((paragraph) => (
                <p key={paragraph} className="mt-3 text-left text-muted">
                  {paragraph}
                </p>
              ))}
              {project.longDescription
                ? paragraphs(project.longDescription).map((paragraph) => (
                    <p key={paragraph} className="mt-3 text-left text-muted">
                      {paragraph}
                    </p>
                  ))
                : null}
              {project.images.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.images.map((image) => (
                    <li key={image}>
                      <img
                        className="h-[50px] w-auto grayscale-[80%] shadow-[0_5px_5px_0_#ccc]"
                        src={`/images/logos/${image}`}
                        alt={`Merkteken van ${project.company}`}
                        width={72}
                        height={50}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.keywords.map((keyword) => {
                  const link = hrefFor(keyword);
                  if (!link) {
                    return null;
                  }
                  return (
                    <li key={keyword}>
                      <a
                        href={link.href}
                        aria-current={link.selected ? "true" : undefined}
                        className={`inline-block rounded-2xl px-3 py-1 text-sm no-underline ${
                          link.selected ? "bg-primary text-white" : "bg-[#ececec] text-ink"
                        }`}
                        onClick={(event) => {
                          event.preventDefault();
                          onSelect(keyword);
                        }}
                      >
                        {keyword}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
