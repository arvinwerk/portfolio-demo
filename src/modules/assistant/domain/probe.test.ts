import { describe, expect, it } from "vitest";
import { ProbeRejected, readProbeQuery } from "./probe";

describe("readProbeQuery", () => {
  it("houdt een zoekterm en weigert de rest", () => {
    expect(readProbeQuery("  Noor  ")).toBe("Noor");
    expect(() => readProbeQuery("")).toThrow(ProbeRejected);
    expect(() => readProbeQuery("a".repeat(201))).toThrow(/te lang/);
  });
});
