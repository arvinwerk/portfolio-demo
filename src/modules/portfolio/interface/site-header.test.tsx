import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("zegt dat de getoonde persoon democontent is", () => {
    render(<SiteHeader name="Noor Linden" />);

    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("Democontent");
    expect(note).toHaveTextContent("Noor Linden");
    expect(note).toHaveTextContent("verzonnen");
  });
});
