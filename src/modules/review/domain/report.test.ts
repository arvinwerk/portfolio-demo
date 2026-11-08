import { describe, expect, it } from "vitest";
import { emptySuggestion, interpretReview, publishedReport, renderReportMarkdown, reportIdentity, reviewDate } from "./report";

describe("reviewDate", () => {
  it("gebruikt de kalenderdag in Amsterdam", () => {
    expect(reviewDate(new Date("2026-11-08T23:30:00Z"), "Europe/Amsterdam")).toBe("2026-11-09");
  });
});

describe("interpretReview", () => {
  it("bewaart alleen schone suggesties en laat een sleutel vallen", () => {
    const report = interpretReview(
      "2026-11-08",
      "interface",
      `## Suggesties
- Maak de kop korter
- Sleutel sk-ant-api03-abcdefghijklmnopqrstuvwxyz
- Mail naar noor.linden@example.com

## Toelichting

De hiërarchie is vlak. Server 136.144.146.87.`,
    );

    expect(report.suggestions[0]).toBe("Maak de kop korter");
    expect(report.suggestions.some((suggestion) => suggestion.includes("sk-ant-"))).toBe(false);
    expect(report.suggestions.some((suggestion) => suggestion.includes("@"))).toBe(false);
    expect(report.body).not.toContain("136.144.146.87");
    expect(report.body).toContain("[adres]");
  });

  it("leest een cijfer van 1 tot 10 en laat een ongeldig cijfer weg", () => {
    const report = interpretReview(
      "2026-11-08",
      "interface",
      `## Score
7/10
## Suggesties
- Maak de kop korter
- Score: 15/10`,
    );

    expect(report.score).toBe(7);
    expect(report.suggestions).toEqual(["Maak de kop korter"]);
    expect(interpretReview("2026-11-08", "content", "Score: 0").score).toBeNull();
    expect(interpretReview("2026-11-08", "content", "").suggestions).toEqual([emptySuggestion]);
    expect(interpretReview("2026-11-08", "content", "").score).toBeNull();
  });
});

describe("publishedReport", () => {
  it("schoont een rapport opnieuw voordat het de pagina op gaat", () => {
    const report = publishedReport({
      date: "2026-11-08",
      lens: "findability",
      score: 12,
      suggestions: ["Zet AI_API_KEY=geheim niet in de titel", "Geef de pagina een beschrijving"],
      body: "Pad /home/arvinwerk/portfolio",
    });

    expect(report.score).toBeNull();
    expect(report.suggestions).toEqual(["Geef de pagina een beschrijving"]);
    expect(report.body).toBe("Pad [pad]");
    expect(renderReportMarkdown(report)).toContain("# Vindbaarheid");
    expect(renderReportMarkdown(report)).toContain("Geen score");
    expect(renderReportMarkdown(report)).not.toContain("geheim");
  });
});

describe("reportIdentity", () => {
  it("herkent alleen een dagrapport", () => {
    expect(reportIdentity("2026-11-08-content.md")).toEqual({ date: "2026-11-08", lens: "content" });
    expect(reportIdentity("notes.md")).toBeUndefined();
    expect(reportIdentity("2026-02-31-interface.md")).toBeUndefined();
  });
});
