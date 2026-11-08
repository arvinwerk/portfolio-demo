import type { ReviewReport } from "./report";

export interface ReviewModel {
  complete(brief: string): Promise<string>;
}

export class ReviewModelError extends Error {
  constructor() {
    super("Het model gaf geen antwoord.");
    this.name = "ReviewModelError";
  }
}

export interface ReportArchive {
  list(): readonly ReviewReport[];
  save(report: ReviewReport): void;
}
