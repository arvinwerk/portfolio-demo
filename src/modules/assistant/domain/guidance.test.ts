import { describe, expect, it } from "vitest";
import { interpretRequest, parseGuidance, parseModelGuidance, readRequest, GuidanceRejected } from "./guidance";

describe("interpretRequest", () => {
  it("opent de werkruimte die bij de vraag hoort", () => {
    expect(interpretRequest("Show me your AI experiments.")).toMatchObject({
      matched: true,
      surface: "experiments",
    });
    expect(interpretRequest("Explain your architecture decisions.")).toMatchObject({
      matched: true,
      surface: "thinking",
      focus: "dependency-rule",
    });
    expect(interpretRequest("Explore your projects.")).toMatchObject({ matched: true, surface: "work" });
    expect(interpretRequest("Show how you would design a scalable AI platform.")).toMatchObject({
      matched: true,
      surface: "challenge",
      focus: "scalable-assistant",
    });
    expect(interpretRequest("Leg je architectuurkeuzes uit.")).toMatchObject({
      surface: "thinking",
      focus: "dependency-rule",
    });
    expect(interpretRequest("Hoe ontwerp je een schaalbaar AI-platform?")).toMatchObject({
      surface: "challenge",
      focus: "scalable-assistant",
    });
    expect(interpretRequest("Laat je AI-experimenten zien.")).toMatchObject({ surface: "experiments" });
    expect(interpretRequest("Geef me een minuut.")).toMatchObject({ surface: "portrait", lead: true, matched: true });
  });

  it("kiest de langste passende zin en laat de rest buiten de catalogus", () => {
    expect(interpretRequest("explain your architecture and then show projects").focus).toBe("dependency-rule");
    expect(interpretRequest("wat is het weer in Kadewijk")).toMatchObject({ matched: false, surface: "portrait" });
  });
});

describe("readRequest", () => {
  it("weigert lege, te lange en niet-tekstuele invoer", () => {
    expect(readRequest("  Hallo  ")).toBe("Hallo");
    expect(() => readRequest("   ")).toThrow(GuidanceRejected);
    expect(() => readRequest("a".repeat(281))).toThrow(/te lang/);
    expect(() => readRequest(12)).toThrow(GuidanceRejected);
  });
});

describe("parseGuidance", () => {
  it("eist een bekende vorm en een herkomst", () => {
    expect(
      parseGuidance({
        surface: "thinking",
        focus: "dependency-rule",
        explanation: "De lagen wijzen naar binnen.",
        origin: "catalog",
      }).surface,
    ).toBe("thinking");
    expect(parseModelGuidance({ surface: "work", focus: null, explanation: "Projecten." })).toMatchObject({
      surface: "work",
      focus: null,
    });
    expect(parseGuidance({ surface: "portrait", focus: null, explanation: "Vier stappen.", origin: "catalog", lead: true }).lead).toBe(
      true,
    );
    expect(parseGuidance({ surface: "portrait", focus: null, explanation: "Vier stappen.", origin: "model", lead: true }).lead).toBe(
      false,
    );
    expect(() => parseGuidance({ surface: "script", focus: null, explanation: "x", origin: "model" })).toThrow(
      GuidanceRejected,
    );
    expect(() => parseModelGuidance({ surface: "work", focus: "../etc", explanation: "x" })).toThrow(GuidanceRejected);
  });
});
