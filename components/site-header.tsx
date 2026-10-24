import { ChatLauncher } from "./chat-launcher";

export function SiteHeader({ name }: { name: string }) {
  return (
    <header id="top" className="sticky top-0 z-30 border-b border-black/5 bg-paper/90 backdrop-blur-md">
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
          <ChatLauncher />
        </nav>
      </div>
    </header>
  );
}
