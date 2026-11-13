import { describe, expect, it } from "vitest";
import { reviewBrief } from "./brief";

describe("reviewBrief", () => {
  it("leest oudere rapporten en laat een sleutel uit het materiaal", () => {
    const brief = reviewBrief({
      date: "2026-11-09",
      lens: "content",
      prior: [
        {
          date: "2026-11-09",
          lens: "interface",
          score: 9,
          suggestions: ["Dit is van vandaag en hoort er niet in"],
          body: "",
        },
        {
          date: "2026-11-08",
          lens: "content",
          score: 6,
          suggestions: ["Maak het voorwoord korter"],
          body: "",
        },
      ],
      excerpts: [
        { label: "content/personal.json", text: "Naam: Noor", audience: "shared" },
        { label: "src/app/layout.tsx", text: "alleen voor de interface", audience: "interface" },
        { label: "content/rag/profile.txt", text: "Het profiel is een demo.\nAI_API_KEY=supersecret", audience: "content" },
      ],
    });

    expect(brief).toContain("6/10");
    expect(brief).toContain("Maak het voorwoord korter");
    expect(brief).not.toContain("Dit is van vandaag");
    expect(brief).not.toContain("supersecret");
    expect(brief).toContain("content/rag/profile.txt");
    expect(brief).not.toContain("src/app/layout.tsx");
    expect(brief).toContain("Content");
  });

  it("neemt een leeg eerder rapport niet mee als inspiratie", () => {
    const brief = reviewBrief({
      date: "2026-11-12",
      lens: "interface",
      prior: [
        {
          date: "2026-11-11",
          lens: "interface",
          score: null,
          suggestions: ["Vandaag geen bruikbaar voorstel."],
          body: "Geen toelichting.",
        },
      ],
      excerpts: [],
    });

    expect(brief).toContain("Er zijn nog geen eerdere rapporten.");
    expect(brief).not.toContain("Vandaag geen bruikbaar voorstel.");
  });
});
