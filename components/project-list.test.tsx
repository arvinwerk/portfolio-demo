import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Project } from "@/lib/types";
import { ProjectList } from "./project-list";

const projects: Project[] = [
  {
    id: 1,
    company: "Studio Noord",
    title: "Componentbibliotheek",
    shortDescription: "Korte tekst.",
    longDescription: "Eerste detail.\n\nTweede detail.",
    keywords: ["React"],
    images: ["ui.svg"],
  },
  {
    id: 2,
    company: "Haven",
    title: "Zonder tekst",
    shortDescription: "Alleen kort.",
    longDescription: null,
    keywords: ["Laravel"],
    images: [],
  },
];

const links = [
  { key: "React", selected: true, href: "/" },
  { key: "Laravel", selected: false, href: "/?keywords=Laravel" },
];

describe("ProjectList", () => {
  it("toont titel, bedrijf, beschrijving en een geselecteerd trefwoord", () => {
    render(<ProjectList projects={projects} links={links} onSelect={() => undefined} />);

    expect(screen.getByRole("heading", { name: "Componentbibliotheek" })).toBeInTheDocument();
    expect(screen.getByText("Studio Noord")).toBeInTheDocument();
    expect(screen.getByText("Tweede detail.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Merkteken van Studio Noord" })).toHaveAttribute(
      "src",
      "/images/logos/ui.svg",
    );
    expect(screen.getByRole("link", { name: "React" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Laravel" })).toHaveAttribute("href", "/?keywords=Laravel");
  });

  it("laat een lege selectie zien", () => {
    render(<ProjectList projects={[]} links={links} onSelect={() => undefined} />);
    expect(screen.getByText("Geen projecten voor deze selectie.")).toBeInTheDocument();
  });
});
