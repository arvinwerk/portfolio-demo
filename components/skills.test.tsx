import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { groupSkills } from "@/lib/skills";
import type { Skill } from "@/lib/types";
import { Skills } from "./skills";

const skills: Skill[] = [
  { name: "TypeScript", percentage: 90, category: "skills" },
  { name: "React", percentage: 80, category: "framework" },
];

describe("Skills", () => {
  it("toont alleen categorieën met skills en de balkbreedte", () => {
    render(<Skills groups={groupSkills(skills)} />);

    expect(screen.getByRole("heading", { name: "Professional" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Frameworks" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Other" })).not.toBeInTheDocument();

    const meter = screen.getByRole("meter", { name: "TypeScript" });
    expect(meter).toHaveAttribute("aria-valuenow", "90");
    expect(meter.querySelector("span")).toHaveStyle({ width: "90%" });
  });

  it("rendert niets zonder skills", () => {
    const { container } = render(<Skills groups={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
