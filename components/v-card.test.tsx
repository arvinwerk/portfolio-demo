import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Personal } from "@/lib/types";
import { VCard } from "./v-card";

const personal: Personal = {
  fullName: "Noor Linden",
  function: "Frontend developer",
  email: "noor.linden@example.com",
  education: "Informatica, Voorbeeld Hogeschool",
  developingStartDate: "2015-08-03",
  linkedIn: "https://example.com/demo/noor-linden/linkedin",
  portfolioUrl: "https://example.com/demo/noor-linden",
  location: "Kadewijk (verzonnen)",
  foreword: "Hoi",
  dateOfBirth: "1993-04-18",
  github: "https://example.com/demo/noor-linden/code",
  githubDescription: "Code",
};

describe("VCard", () => {
  it("toont naam, opleiding en contactlinks", () => {
    render(<VCard personal={personal} />);

    expect(screen.getByRole("heading", { name: "Noor Linden" })).toBeInTheDocument();
    expect(screen.getByText("Informatica, Voorbeeld Hogeschool")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "noor.linden@example.com" })).toHaveAttribute(
      "href",
      "mailto:noor.linden@example.com",
    );
    expect(screen.getByRole("link", { name: "example.com/demo/noor-linden" })).toHaveAttribute(
      "href",
      "https://example.com/demo/noor-linden",
    );
    expect(screen.getByText("Kadewijk (verzonnen)")).toBeInTheDocument();
  });
});
