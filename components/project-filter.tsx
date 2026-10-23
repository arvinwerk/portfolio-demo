import Link from "next/link";
import type { KeywordLink } from "@/lib/types";

export function ProjectFilter({ links, allSelected }: { links: KeywordLink[]; allSelected: boolean }) {
  return (
    <nav className="filters" aria-label="Filter op trefwoord">
      <Link href="/" aria-current={allSelected ? "true" : undefined} className={allSelected ? "is-active" : undefined}>
        Alles
      </Link>
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          aria-current={link.selected ? "true" : undefined}
          className={link.selected ? "is-active" : undefined}
        >
          {link.key}
        </Link>
      ))}
    </nav>
  );
}
