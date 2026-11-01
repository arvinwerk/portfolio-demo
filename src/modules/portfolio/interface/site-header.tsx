import type { MouseEvent, ReactNode } from "react";

export function SiteHeader({
  name,
  disclaimer,
  action,
  onSection,
  onMinute,
  xray,
}: {
  name: string;
  disclaimer: string;
  action?: ReactNode;
  onSection?: (id: string) => void;
  onMinute?: () => void;
  xray?: { pressed: boolean; onToggle: () => void };
}) {
  return (
    <>
      <div id="top" className="h-0" />
      <header className="sticky top-0 z-30 border-b border-black/5 bg-paper/90 backdrop-blur-md" data-boundary="kop">
        <p className="bg-ink px-4 py-2 text-center text-sm text-white" role="note">
          {disclaimer}
        </p>
        <div className="mx-auto flex min-h-16 max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <a
            className="font-display text-lg font-semibold tracking-tight text-primary no-underline"
            href="#top"
            onClick={onSection ? (event) => followSection(event, onSection, "top") : undefined}
          >
            {name}
          </a>
          <nav className="flex items-center gap-4 text-sm sm:gap-6" aria-label="Secties">
            <a className="text-ink no-underline hover:text-primary" href="#over" onClick={onSection ? (event) => followSection(event, onSection, "over") : undefined}>
              Over
            </a>
            <a className="text-ink no-underline hover:text-primary" href="#skills" onClick={onSection ? (event) => followSection(event, onSection, "skills") : undefined}>
              Skills
            </a>
            <a className="text-ink no-underline hover:text-primary" href="#werk" onClick={onSection ? (event) => followSection(event, onSection, "werk") : undefined}>
              Werk
            </a>
            <a className="text-ink no-underline hover:text-primary" href="#contact" onClick={onSection ? (event) => followSection(event, onSection, "contact") : undefined}>
              Contact
            </a>
            {onMinute ? (
              <button type="button" className="text-ink hover:text-primary" onClick={onMinute}>
                Een minuut
              </button>
            ) : null}
            {action}
            {xray ? (
              <button
                type="button"
                className={`px-3 py-1.5 font-ui text-xs tracking-[0.14em] uppercase ${
                  xray.pressed ? "bg-ink text-white" : "text-ink ring-1 ring-black/10"
                }`}
                aria-pressed={xray.pressed}
                onClick={xray.onToggle}
              >
                Röntgen
              </button>
            ) : null}
          </nav>
        </div>
      </header>
    </>
  );
}

function followSection(event: MouseEvent<HTMLAnchorElement>, onSection: (id: string) => void, id: string) {
  event.preventDefault();
  onSection(id);
}
