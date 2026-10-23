import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectFilter } from "./project-filter";

describe("ProjectFilter", () => {
  it("markeert Alles en wijst elk trefwoord naar zijn href", () => {
    render(
      <ProjectFilter
        allSelected
        links={[
          { key: "Angular", selected: false, href: "/?keywords=Angular" },
          { key: "React", selected: false, href: "/?keywords=React" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Alles" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Alles" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Angular" })).toHaveAttribute("href", "/?keywords=Angular");
    expect(screen.getByRole("link", { name: "React" })).not.toHaveAttribute("aria-current");
  });
});
