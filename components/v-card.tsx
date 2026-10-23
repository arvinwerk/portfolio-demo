import { displayUrl } from "@/lib/text";
import type { Personal } from "@/lib/types";

export function VCard({ personal }: { personal: Personal }) {
  return (
    <section className="relative z-10 -mt-16 px-4 sm:-mt-[194px]" aria-label="Profiel">
      <div className="relative mx-auto max-w-[1000px]">
        <img
          className="absolute top-0 left-1/2 z-20 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover shadow-material sm:hidden"
          src="/images/profile.svg"
          alt=""
          width={150}
          height={150}
        />
        <div className="relative overflow-hidden bg-primary text-white shadow-card sm:h-[400px]">
          <div className="relative z-10 px-6 pt-24 text-center sm:max-w-[520px] sm:px-10 sm:pt-14 sm:text-left">
            <h1 className="font-display text-[2.2rem] leading-none font-black tracking-wide text-white uppercase [text-shadow:2px_2px_4px_rgba(0,0,0,0.29)] sm:text-5xl">
              {personal.fullName}
            </h1>
            <p className="mt-3 font-display text-xl font-light text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.29)]">
              {personal.function}
            </p>
            <p className="mt-1 text-sm text-white/85">{personal.education}</p>
            <ul className="mt-8 space-y-3 text-left sm:mt-14">
              <Contact icon="mail" href={`mailto:${personal.email}`}>
                {personal.email}
              </Contact>
              <Contact icon="people" href={personal.linkedIn} external>
                LinkedIn
              </Contact>
              <Contact icon="language" href={personal.portfolioUrl}>
                {displayUrl(personal.portfolioUrl)}
              </Contact>
              <li className="flex items-center gap-3 text-[15px] text-white">
                <Icon name="place" />
                <span>{personal.location}</span>
              </li>
            </ul>
          </div>
          <div className="absolute top-0 right-0 hidden h-[400px] w-[400px] sm:block">
            <img
              className="h-full w-full object-cover"
              src="/images/profile.svg"
              alt={`Monogram van ${personal.fullName}`}
              width={400}
              height={400}
            />
            <div
              className="absolute top-0 left-0 h-0 w-0 border-t-[400px] border-l-[100px] border-solid border-t-transparent border-l-primary"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact({
  icon,
  href,
  external,
  children,
}: {
  icon: IconName;
  href: string;
  external?: boolean;
  children: string;
}) {
  return (
    <li className="flex items-center gap-3 text-[15px]">
      <Icon name={icon} />
      <a
        className="text-white no-underline hover:underline"
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    </li>
  );
}

type IconName = "mail" | "people" | "language" | "place";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    mail: "M3 6.5h18v11H3v-11Zm1.6.9 7.4 5.2 7.4-5.2H4.6Z",
    people: "M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11Zm6.2-.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM3.5 18.2c.4-2.6 2.7-4.2 5.5-4.2s5.1 1.6 5.5 4.2v.8H3.5v-.8Zm11 .3c-.2-1.5-1-2.8-2.3-3.6 1.8-.2 3.8.6 4.6 2.8l.3.8h-2.6v-.1Z",
    language: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm6.3 7.6h-3.1a13 13 0 0 0-1.2-4.6 6.6 6.6 0 0 1 4.3 4.6ZM12 5.2c.7 1 1.4 2.6 1.8 4.9h-3.6c.4-2.3 1.1-3.9 1.8-4.9ZM5.7 11.1a6.6 6.6 0 0 1 4.3-4.6 13 13 0 0 0-1.2 4.6H5.7Zm0 1.8h3.1c.2 1.7.7 3.3 1.2 4.6a6.6 6.6 0 0 1-4.3-4.6Zm6.3 6.9c-.7-1-1.4-2.6-1.8-4.9h3.6c-.4 2.3-1.1 3.9-1.8 4.9Zm1.9-4.9c-.2 1.7-.7 3.3-1.2 4.6a6.6 6.6 0 0 0 4.3-4.6h-3.1Z",
    place: "M12 3.8a5.2 5.2 0 0 0-5.2 5.2c0 3.9 5.2 11.2 5.2 11.2s5.2-7.3 5.2-11.2A5.2 5.2 0 0 0 12 3.8Zm0 7.1a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8Z",
  };

  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="currentColor" />
    </svg>
  );
}
