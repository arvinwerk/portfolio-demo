import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AgentsView } from "./agents-view";

describe("AgentsView", () => {
  it("toont de lege pagina zonder rapporten", () => {
    render(<AgentsView siteName="Noor Linden" model={{ days: [] }} />);

    expect(screen.getByRole("heading", { level: 1, name: "Dagelijkse voorstellen" })).toBeVisible();
    expect(screen.getByText(/Nog geen rapport/)).toBeVisible();
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
});
