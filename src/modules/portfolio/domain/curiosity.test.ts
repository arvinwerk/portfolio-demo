import { describe, expect, it } from "vitest";
import { isCuriosity, parseCuriosity } from "./curiosity";

describe("parseCuriosity", () => {
  it("herkent een bekende ingang", () => {
    expect(parseCuriosity("thinking")).toBe("thinking");
    expect(parseCuriosity(["work", "thinking"])).toBe("work");
  });

  it("valt terug op het portret", () => {
    expect(parseCuriosity(undefined)).toBe("portrait");
    expect(parseCuriosity("ergens")).toBe("portrait");
    expect(parseCuriosity(3)).toBe("portrait");
    expect(isCuriosity("portrait")).toBe(true);
    expect(isCuriosity("home")).toBe(false);
  });
});
