import { type KeywordLink, keywordsToHref } from "./keyword-href";

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
    <nav className="flex flex-wrap gap-2" aria-label="Filter op trefwoord">
      <FilterLink href={keywordsToHref([])} selected={allSelected} onClick={() => onSelect(null)}>
        Alles
      </FilterLink>
      {links.map((link) => (
        <FilterLink key={link.key} href={link.href} selected={link.selected} onClick={() => onSelect(link.key)}>
          {link.key}
        </FilterLink>
      ))}
    </nav>
  );
}

function FilterLink({
  href,
  selected,
  onClick,
  children,
}: {
  href: string;
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <a
      href={href}
      aria-current={selected ? "true" : undefined}
      className={`inline-block rounded-full px-4 py-2 font-ui text-sm no-underline ${
        selected ? "bg-primary text-white" : "bg-white text-ink ring-1 ring-black/10 hover:ring-primary/40"
      }`}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  );
}
