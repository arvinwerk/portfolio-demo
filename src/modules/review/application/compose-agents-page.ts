import { lensTitle, reviewLenses, type ReviewLens } from "../domain/lens";
import { averageReviewScore, publishedReport, type ReviewReport } from "../domain/report";

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
    days: dates.map((date) => ({
      date,
      averageScore: averageReviewScore(
        published.filter((report) => report.date === date).map((report) => report.score),
      ),
      reports: reviewLenses.flatMap((lens) => {
        const report = published.find((candidate) => candidate.date === date && candidate.lens === lens);
        if (!report) {
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
      }),
    })),
  };
}
