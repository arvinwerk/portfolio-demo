import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Project } from "@/lib/types";
import { WorkExplorer } from "./work-explorer";

const { push } = vi.hoisted(() => ({
  push: vi.fn((href: string) => {
    window.history.pushState(null, "", href);
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const projects: Project[] = [
  {
    id: 1,
    company: "Festival Noordlicht",
    title: "Lichtarrangementen",
    shortDescription: "Campagne",
    longDescription: null,
    keywords: ["Angular"],
    images: [],
  },
  {
    id: 2,
    company: "Circuit Meridiaan",
    title: "Baan VIP",
    shortDescription: "Grand Prix",
    longDescription: null,
    keywords: ["Laravel"],
    images: [],
  },
  {
    id: 4,
    company: "Haven & Co",
    title: "Content-API",
    shortDescription: "Server",
    longDescription: null,
    keywords: ["Laravel"],
    images: [],
  },
];

describe("WorkExplorer", () => {
  it("filtert in de pagina en zet de keuze in de URL zonder te scrollen", () => {
    push.mockClear();
    render(<WorkExplorer projects={projects} initialSelected={[]} />);

    const filters = screen.getByRole("navigation", { name: "Filter op trefwoord" });
    fireEvent.click(within(filters).getByRole("link", { name: "Laravel" }));

    expect(screen.getByRole("heading", { name: "Baan VIP" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Content-API" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Lichtarrangementen" })).not.toBeInTheDocument();
    expect(push).toHaveBeenCalledWith("/?keywords=Laravel#werk", { scroll: false });
    expect(window.location.search).toBe("?keywords=Laravel");
    expect(window.location.hash).toBe("#werk");

    fireEvent.click(within(filters).getByRole("link", { name: "Alles" }));

    expect(screen.getByRole("heading", { name: "Lichtarrangementen" })).toBeInTheDocument();
    expect(push).toHaveBeenLastCalledWith("/#werk", { scroll: false });
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("");
  });
});
