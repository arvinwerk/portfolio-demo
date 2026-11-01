import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { assemblePortfolio } from "../domain/portfolio";
import type { Banner, PersonalProfile, ProjectDraft, Skill } from "../domain/model";
import { composePortfolioPage } from "../application/compose-portfolio-page";
import { Experience } from "./experience";

const { push } = vi.hoisted(() => ({
  push: vi.fn((href: string) => {
    window.history.pushState(null, "", href);
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("next/dynamic", () => ({
  default: () =>
    function CanvasStub() {
      return <div>Kaart</div>;
    },
}));

vi.mock("motion/react", () => ({
  useReducedMotion: () => true,
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: {
    div: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  },
}));

const profile: PersonalProfile = {
  fullName: "Noor Linden",
  function: "Frontend developer",
  email: "noor.linden@example.com",
  education: "Informatica",
  developingStartDate: "2016-01-15",
  linkedIn: "https://example.com/linkedin",
  portfolioUrl: "https://example.com",
  location: "Kadewijk",
  foreword: "Voorwoord.",
  dateOfBirth: "1994-06-20",
  github: "https://example.com/github",
  githubDescription: "Bron.",
};

const skills: Skill[] = [{ name: "React", percentage: 80, category: "framework" }];
const projects: ProjectDraft[] = [
  {
    company: "Studio Noord",
    title: "Componentbibliotheek",
    shortDescription: "Kort",
    longDescription: null,
    keywords: ["React"],
    images: [],
  },
];
const banners: Banner[] = [];

function model() {
  return composePortfolioPage(assemblePortfolio({ profile, skills, projects, banners }), {
    now: new Date(2026, 9, 23),
  });
}

describe("Experience", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    push.mockClear();
    window.history.pushState(null, "", "/");
  });

  it("opent de architectuur vanuit de ingang en houdt het profiel herkenbaar", () => {
    render(<Experience model={model()} />);

    expect(screen.getByRole("heading", { level: 1, name: "Noor Linden" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Hoe ik denk/ }));

    expect(push).toHaveBeenCalledWith("/?lens=thinking", { scroll: false });
    expect(screen.getByRole("heading", { name: "Hoe deze applicatie in elkaar zit" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Domain" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Hele pagina" })).toBeVisible();
  });

  it("loopt de minuut van het vak naar één project", () => {
    render(<Experience model={model()} />);
    fireEvent.click(screen.getByRole("button", { name: "Begin de minuut" }));

    expect(push).toHaveBeenCalledWith("/?minuut=wie", { scroll: false });
    expect(screen.getByRole("heading", { name: "Eerst het vak" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Volgende" }));

    expect(push).toHaveBeenCalledWith("/?minuut=bewijs", { scroll: false });
    expect(screen.getByRole("heading", { name: "Eén project" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Componentbibliotheek" })).toBeVisible();
  });

  it("laat een gids de werkruimte en de toelichting openen", () => {
    render(<Experience model={model()} />);
    act(() => {
      window.dispatchEvent(
        new CustomEvent("portfolio-guide", {
          detail: {
            surface: "challenge",
            focus: "scalable-assistant",
            explanation: "De opdracht ligt klaar.",
            origin: "catalog",
          },
        }),
      );
    });

    expect(screen.getByRole("heading", { name: "Een AI-laag die meegroeit" })).toBeVisible();
    expect(screen.getByText("De opdracht ligt klaar.")).toBeVisible();
    expect(screen.getByText(/Vooraf bepaalde verkenning/)).toBeVisible();
  });

  it("toont gemeten grenzen in de röntgenstand", () => {
    render(<Experience model={model()} />);
    fireEvent.click(screen.getByRole("button", { name: "Röntgen" }));
    expect(screen.getByRole("heading", { name: "Gemeten" })).toBeVisible();
    expect(screen.getByText("Profiel")).toBeVisible();
    expect(screen.getByText(/Toelichting/)).toBeVisible();
  });
});
