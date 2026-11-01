import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("toont de persoonlijke balk en houdt de vaste navigatie", () => {
    render(<SiteHeader name="Noor Linden" disclaimer="Democontent over Ada." />);

    expect(screen.getByRole("note")).toHaveTextContent("Democontent over Ada.");
    expect(screen.getByRole("link", { name: "Over" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Werk" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Noor Linden" })).toBeInTheDocument();
  });
});
