import { describe, expect, it } from "vitest";
import { composeAgentsPage } from "./compose-agents-page";

describe("composeAgentsPage", () => {
  it("zet de nieuwste dag eerst en de lenzen in vaste volgorde", () => {
    const page = composeAgentsPage([
      { date: "2026-11-08", lens: "findability", score: 5, suggestions: ["Beschrijving toevoegen"], body: "Kort." },
      { date: "2026-11-09", lens: "content", score: 6, suggestions: ["Voorwoord inkorten"], body: "Eerste alinea.\n\nTweede alinea." },
      { date: "2026-11-09", lens: "interface", score: 8, suggestions: ["Kop inkorten"], body: "" },
    ]);

    expect(page.days.map((day) => day.date)).toEqual(["2026-11-09", "2026-11-08"]);
    expect(page.days[0]?.reports.map((report) => report.lens)).toEqual(["interface", "content"]);
    expect(page.days[0]?.reports[1]?.paragraphs).toEqual(["Eerste alinea.", "Tweede alinea."]);
    expect(page.days[0]?.averageScore).toBe(7);
    expect(page.days[0]?.reports.map((report) => report.score)).toEqual([8, 6]);
  });

  it("toont een schone suggestie als het bestand een sleutel bevat", () => {
    const page = composeAgentsPage([
      {
        date: "2026-11-08",
        lens: "interface",
        score: 4,
        suggestions: ["sk-ant-api03-abcdefghijklmnopqrstuvwxyz"],
        body: "noor.linden@example.com",
      },
    ]);

    expect(page.days[0]?.reports[0]?.suggestions).toEqual(["Vandaag geen bruikbaar voorstel."]);
    expect(page.days[0]?.reports[0]?.paragraphs.join(" ")).not.toContain("example.com");
  });
});
