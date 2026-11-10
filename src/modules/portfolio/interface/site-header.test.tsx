import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("toont de naam zonder een vast oordeel over de persoon", () => {
    render(<SiteHeader name="Noor Linden" />);

    expect(screen.getByRole("link", { name: "Noor Linden" })).toHaveAttribute("href", "#top");
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });
});
