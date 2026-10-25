import type { ReactNode } from "react";

export function SiteHeader({ name, action }: { name: string; action?: ReactNode }) {
  return (
    <>
      <div id="top" className="h-0" />
      <header className="sticky top-0 z-30 border-b border-black/5 bg-paper/90 backdrop-blur-md">
        <p className="bg-ink px-4 py-2 text-center text-sm text-white" role="note">
          Democontent. {name} is een verzonnen developer. Projecten, teksten en de chat horen bij niemand.
        </p>
        <div className="mx-auto flex min-h-16 max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <a className="font-display text-lg font-semibold tracking-tight text-primary no-underline" href="#top">
            {name}
          </a>
          <nav className="flex items-center gap-4 text-sm sm:gap-6" aria-label="Secties">
            <a className="text-ink no-underline hover:text-primary" href="#over">
              Over
            </a>
            <a className="text-ink no-underline hover:text-primary" href="#skills">
              Skills
            </a>
            <a className="text-ink no-underline hover:text-primary" href="#werk">
              Werk
            </a>
            <a className="text-ink no-underline hover:text-primary" href="#contact">
              Contact
            </a>
            {action}
          </nav>
        </div>
      </header>
    </>
  );
}
