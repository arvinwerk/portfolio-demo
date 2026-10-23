import type { KeywordLink } from "@/lib/types";

export function ProjectFilter({
  links,
  allSelected,
  onSelect,
}: {
  links: KeywordLink[];
  allSelected: boolean;
  onSelect: (key: string | null) => void;
}) {
  return (
    <nav className="filters" aria-label="Filter op trefwoord">
      <a
        href="/"
        aria-current={allSelected ? "true" : undefined}
        className={allSelected ? "is-active" : undefined}
        onClick={(event) => {
          event.preventDefault();
          onSelect(null);
        }}
      >
        Alles
      </a>
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          aria-current={link.selected ? "true" : undefined}
          className={link.selected ? "is-active" : undefined}
          onClick={(event) => {
            event.preventDefault();
            onSelect(link.key);
          }}
        >
          {link.key}
        </a>
      ))}
    </nav>
  );
}
