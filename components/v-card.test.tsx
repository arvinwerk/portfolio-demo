import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Personal } from "@/lib/types";
import { VCard } from "./v-card";

const personal: Personal = {
  fullName: "Arvin Sokarijo",
  function: "Frontend developer",
  email: "hello@example.com",
  education: "Voorbeeldopleiding",
  developingStartDate: "2016-01-15",
  linkedIn: "https://www.linkedin.com",
  portfolioUrl: "https://example.com/werk",
  location: "Nederland",
  foreword: "Hoi",
  dateOfBirth: "1994-06-20",
  github: "https://github.com/arvinwerk",
  githubDescription: "Code",
};

describe("VCard", () => {
  it("toont naam, opleiding en contactlinks", () => {
    render(<VCard personal={personal} />);

    expect(screen.getByRole("heading", { name: "Arvin Sokarijo" })).toBeInTheDocument();
    expect(screen.getByText("Voorbeeldopleiding")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "hello@example.com" })).toHaveAttribute(
      "href",
      "mailto:hello@example.com",
    );
    expect(screen.getByRole("link", { name: "example.com/werk" })).toHaveAttribute(
      "href",
      "https://example.com/werk",
    );
    expect(screen.getByText("Nederland")).toBeInTheDocument();
  });
});
