import Link from "next/link";
import type { KeywordLink, Project } from "@/lib/types";
import { paragraphs } from "@/lib/text";

export function ProjectList({ projects, links }: { projects: Project[]; links: KeywordLink[] }) {
  if (projects.length === 0) {
    return <p className="empty">Geen projecten voor deze selectie.</p>;
  }

  const hrefFor = (keyword: string) => links.find((link) => link.key === keyword);

  return (
    <ol className="timeline">
      {projects.map((project) => (
        <li key={project.id}>
          <article className="project">
            <p className="project__index">{String(project.id).padStart(2, "0")}</p>
            <div>
              <h3>{project.title}</h3>
              <p className="project__company">{project.company}</p>
              {paragraphs(project.shortDescription).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {project.longDescription
                ? paragraphs(project.longDescription).map((paragraph) => (
                    <p key={paragraph} className="project__long">
                      {paragraph}
                    </p>
                  ))
                : null}
              {project.images.length > 0 ? (
                <ul className="project__logos">
                  {project.images.map((image) => (
                    <li key={image}>
                      <img src={`/images/logos/${image}`} alt={`Merkteken van ${project.company}`} width={72} height={72} />
                    </li>
                  ))}
                </ul>
              ) : null}
              <ul className="project__keywords">
                {project.keywords.map((keyword) => {
                  const link = hrefFor(keyword);
                  if (!link) {
                    return null;
                  }
                  return (
                    <li key={keyword}>
                      <Link href={link.href} aria-current={link.selected ? "true" : undefined}>
                        {keyword}
                      </Link>
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
