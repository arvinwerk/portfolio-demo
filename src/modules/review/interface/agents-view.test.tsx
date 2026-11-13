import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AgentsView } from "./agents-view";

describe("AgentsView", () => {
  afterEach(() => {
    cleanup();
  });

  it("toont de lege pagina zonder rapporten", () => {
    render(<AgentsView siteName="Noor Linden" model={{ days: [] }} />);

    expect(screen.getByRole("heading", { level: 1, name: "Dagelijkse voorstellen" })).toBeVisible();
    expect(screen.getByText("Nog geen voorstel.")).toBeVisible();
    expect(screen.queryByText(/sleutels of andere gevoelige gegevens/)).toBeNull();
    expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute("href", "/");
  });

  it("tekent een voorstel als tekst en niet als html", () => {
    const { container } = render(
      <AgentsView
        siteName="Noor Linden"
        model={{
          days: [
            {
              date: "2026-11-08",
              averageScore: 7,
              reports: [
                {
                  date: "2026-11-08",
                  lens: "interface",
                  title: "UI en gebruik",
                  score: 7,
                  suggestions: ["<script>alert(1)</script>"],
                  paragraphs: ["Houd de hiërarchie rustig."],
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "8 november 2026" })).toBeVisible();
    expect(screen.getByLabelText("Score 7 van 10")).toHaveTextContent("7/10");
    expect(screen.getByText("Gemiddeld 7/10")).toBeVisible();
    expect(screen.getByText("<script>alert(1)</script>")).toBeVisible();
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("Houd de hiërarchie rustig.")).toBeVisible();
  });

  it("laat de lijst weg als er geen voorstel is", () => {
    render(
      <AgentsView
        siteName="Noor Linden"
        model={{
          days: [
            {
              date: "2026-11-08",
              averageScore: 7,
              reports: [
                {
                  date: "2026-11-08",
                  lens: "content",
                  title: "Content",
                  score: 7,
                  suggestions: [],
                  paragraphs: ["De eerste alinea is duidelijk."],
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(screen.getByLabelText("Score 7 van 10")).toBeVisible();
    expect(screen.getByText("De eerste alinea is duidelijk.")).toBeVisible();
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryByText("Vandaag geen bruikbaar voorstel.")).toBeNull();
  });
});
