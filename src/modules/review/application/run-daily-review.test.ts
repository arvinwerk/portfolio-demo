import { describe, expect, it } from "vitest";
import { ReviewModelError, type ReportArchive, type ReviewModel } from "../domain/ports";
import type { ReviewReport } from "../domain/report";
import { runDailyReview } from "./run-daily-review";

describe("runDailyReview", () => {
  it("schrijft drie rapporten en geeft de vorige dag mee aan de volgende run", async () => {
    const archive = memoryArchive();
    const prompts: string[] = [];
    const model: ReviewModel = {
      async complete(brief) {
        prompts.push(brief);
        return "- Houd de volgende stap klein";
      },
    };

    const first = await runDailyReview({
      now: new Date("2026-11-08T10:00:00Z"),
      excerpts: [{ label: "src/app/page.tsx", text: "home", audience: "shared" }],
      model,
      archive,
    });
    const second = await runDailyReview({
      now: new Date("2026-11-09T10:00:00Z"),
      excerpts: [{ label: "src/app/page.tsx", text: "home", audience: "shared" }],
      model,
      archive,
    });

    expect(first.map((report) => report.lens)).toEqual(["interface", "content", "findability"]);
    expect(second).toHaveLength(3);
    expect(prompts[0]).not.toContain("Houd de volgende stap klein");
    expect(prompts[3]).toContain("Houd de volgende stap klein");
    expect(archive.list()).toHaveLength(6);
  });

  it("bewaart geen rapport als het model geen antwoord geeft", async () => {
    const archive = memoryArchive();
    const model: ReviewModel = {
      async complete() {
        throw new ReviewModelError();
      },
    };

    const reports = await runDailyReview({
      now: new Date("2026-11-08T10:00:00Z"),
      excerpts: [],
      model,
      archive,
    });

    expect(reports).toEqual([]);
    expect(archive.list()).toEqual([]);
  });
});

function memoryArchive(): ReportArchive {
  const reports: ReviewReport[] = [];
  return {
    list: () => reports,
    save(report) {
      const index = reports.findIndex((candidate) => candidate.date === report.date && candidate.lens === report.lens);
      if (index >= 0) {
        reports[index] = report;
      } else {
        reports.push(report);
      }
    },
  };
}
