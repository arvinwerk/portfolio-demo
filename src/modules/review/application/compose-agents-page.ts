import { lensTitle, reviewLenses, type ReviewLens } from "../domain/lens";
import { averageReviewScore, publishedReport, reportHasFinding, type ReviewReport } from "../domain/report";

export type AgentReportCard = {
  date: string;
  lens: ReviewLens;
  title: string;
  score: number | null;
  suggestions: readonly string[];
  paragraphs: readonly string[];
};

export type AgentsPage = {
  days: readonly {
    date: string;
    averageScore: number | null;
    reports: readonly AgentReportCard[];
  }[];
};

export function composeAgentsPage(reports: readonly ReviewReport[]): AgentsPage {
  const published = reports.map((report) => publishedReport(report));
  const dates = [...new Set(published.map((report) => report.date))].toSorted((left, right) => right.localeCompare(left));

  return {
    days: dates.flatMap((date) => {
      const cards = reviewLenses.flatMap((lens) => {
        const report = published.find((candidate) => candidate.date === date && candidate.lens === lens);
        if (!report || !reportHasFinding(report)) {
          return [];
        }
        return [
          {
            date,
            lens,
            title: lensTitle[lens],
            score: report.score,
            suggestions: report.suggestions,
            paragraphs: report.body
              .split(/\n\n+/)
              .map((paragraph) => paragraph.trim())
              .filter((paragraph) => paragraph.length > 0)
              .slice(0, 6),
          },
        ];
      });
      if (cards.length === 0) {
        return [];
      }
      return [
        {
          date,
          averageScore: averageReviewScore(cards.map((report) => report.score)),
          reports: cards,
        },
      ];
    }),
  };
}
