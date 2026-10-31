import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StudyBench } from "./study-bench";

afterEach(() => {
  cleanup();
});

describe("StudyBench", () => {
  it("laat een gewijzigde tekst het demonstratiezegel breken", async () => {
    render(<StudyBench />);
    fireEvent.click(screen.getByRole("tab", { name: "Zegel" }));
    fireEvent.click(screen.getByRole("button", { name: "Verzegel" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Controleer" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Controleer" }));
    expect(await screen.findByText("Het zegel klopt.")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Tekst"), { target: { value: "Een andere tekst." } });
    fireEvent.click(screen.getByRole("button", { name: "Controleer" }));
    expect(await screen.findByText(/Het zegel breekt/)).toBeVisible();
  });

  it("toont de echte tempo-grenzen", () => {
    render(<StudyBench />);
    fireEvent.click(screen.getByRole("tab", { name: "Tempo" }));
    expect(screen.getByText("8")).toBeVisible();
    expect(screen.getByText("100")).toBeVisible();
    expect(screen.getByText(/Dit paneel doet geen verzoek/)).toBeVisible();
  });
});
