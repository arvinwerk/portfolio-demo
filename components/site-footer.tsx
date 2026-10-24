export function SiteFooter({
  name,
  email,
  linkedIn,
  github,
}: {
  name: string;
  email: string;
  linkedIn: string;
  github: string;
}) {
  return (
    <footer id="contact" className="bg-primary text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-16 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-ui text-xs font-medium tracking-[0.22em] text-white/70 uppercase">Contact</p>
          <p className="mt-3 font-display text-4xl font-semibold tracking-tight text-white">{name}</p>
        </div>
        <ul className="flex flex-col gap-3 text-sm sm:items-end">
          <li>
            <a className="text-white no-underline hover:underline" href={`mailto:${email}`}>
              {email}
            </a>
          </li>
          <li>
            <a className="text-white no-underline hover:underline" href={linkedIn} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="text-white no-underline hover:underline" href={github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </li>
        </ul>
      </div>
      <p className="border-t border-white/15 px-4 py-4 pr-24 text-center text-sm text-white/75">Gemaakt door {name}</p>
    </footer>
  );
}
