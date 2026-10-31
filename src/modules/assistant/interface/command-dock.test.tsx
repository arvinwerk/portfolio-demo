import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommandDock } from "./command-dock";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CommandDock", () => {
  it("stuurt een vraag en geeft een gecontroleerde gids door", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        surface: "thinking",
        focus: "dependency-rule",
        explanation: "De lagen wijzen naar binnen.",
        origin: "catalog",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const received: unknown[] = [];
    const onGuide = (event: Event) => received.push((event as CustomEvent<unknown>).detail);
    window.addEventListener("portfolio-guide", onGuide);

    render(<CommandDock />);
    fireEvent.change(screen.getByLabelText("Verkenning"), { target: { value: "Leg je architectuurkeuzes uit." } });
    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => expect(received).toHaveLength(1));
    expect(received[0]).toMatchObject({ surface: "thinking", origin: "catalog" });
    expect(fetchMock).toHaveBeenCalledWith("/api/guide", expect.objectContaining({ method: "POST" }));

    window.removeEventListener("portfolio-guide", onGuide);
    vi.unstubAllGlobals();
  });

  it("weigert een antwoord met een onbekende vorm", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ surface: "eval", explanation: "code", origin: "model" })));
    render(<CommandDock />);
    fireEvent.change(screen.getByLabelText("Verkenning"), { target: { value: "doe iets" } });
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("De verkenning lukte niet. Probeer het opnieuw.")).toBeVisible();
    vi.unstubAllGlobals();
  });
});
