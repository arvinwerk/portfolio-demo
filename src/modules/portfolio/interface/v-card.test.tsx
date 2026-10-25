import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PersonalProfile } from "../domain/model";
import { VCard } from "./v-card";

const profile: PersonalProfile = {
  fullName: "[Naam]",
  function: "[Functie]",
  email: "naam@example.com",
  education: "[Opleiding]",
  developingStartDate: "2016-01-15",
  linkedIn: "https://example.com/linkedin",
  portfolioUrl: "https://example.com/werk",
  location: "[Locatie]",
  foreword: "Hoi",
  dateOfBirth: "1994-06-20",
  github: "https://example.com/github",
  githubDescription: "Code",
};

describe("VCard", () => {
  it("toont naam, opleiding en contactlinks", () => {
    render(<VCard profile={profile} />);

    expect(screen.getByRole("heading", { name: "[Naam]" })).toBeInTheDocument();
    expect(screen.getByText("[Opleiding]")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "naam@example.com" })).toHaveAttribute(
      "href",
      "mailto:naam@example.com",
    );
    expect(screen.getByRole("link", { name: "example.com/werk" })).toHaveAttribute(
      "href",
      "https://example.com/werk",
    );
    expect(screen.getByText("[Locatie]")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://example.com/linkedin");
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://example.com/github");
  });
});
