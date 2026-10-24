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
    return <p className="mt-8 text-muted">Geen projecten voor deze selectie.</p>;
  }

  const hrefFor = (keyword: string) => links.find((link) => link.key === keyword);

  return (
    <ol className="mt-8 space-y-5">
      {projects.map((project) => (
        <li key={project.id}>
          <article className="grid gap-4 bg-white p-5 shadow-card sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 sm:p-7">
            <span className="font-display text-sm font-semibold tracking-tight text-primary">
              {String(project.id).padStart(2, "0")}
            </span>
            <div>
              <p className="font-ui text-xs font-medium tracking-[0.16em] text-primary uppercase">{project.company}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{project.title}</h3>
              {paragraphs(project.shortDescription).map((paragraph) => (
                <p key={paragraph} className="mt-3 text-ink">
                  {paragraph}
                </p>
              ))}
              {project.longDescription
                ? paragraphs(project.longDescription).map((paragraph) => (
                    <p key={paragraph} className="mt-3 text-muted">
                      {paragraph}
                    </p>
                  ))
                : null}
              {project.images.length > 0 ? (
                <ul className="mt-5 flex flex-wrap gap-3">
                  {project.images.map((image) => (
                    <li key={image} className="bg-paper px-3 py-2">
                      <img
                        className="h-10 w-auto"
                        src={`/images/logos/${image}`}
                        alt={`Merkteken van ${project.company}`}
                        width={72}
                        height={40}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
              <ul className="mt-5 flex flex-wrap gap-2">
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
                        className={`inline-block rounded-full px-3 py-1 text-sm no-underline ${
                          link.selected ? "bg-primary text-white" : "bg-paper text-ink"
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
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}
