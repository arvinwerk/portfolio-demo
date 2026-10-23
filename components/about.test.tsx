import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { About } from "./about";

describe("About", () => {
  it("zet het voorwoord en de code-link neer", () => {
    render(
      <About
        foreword={["Ik ben 32."]}
        github="https://github.com/arvinwerk"
        githubDescription={["Bron op GitHub."]}
      />,
    );

    expect(screen.getByText("Ik ben 32.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Code" })).toHaveAttribute("href", "https://github.com/arvinwerk");
  });
});
