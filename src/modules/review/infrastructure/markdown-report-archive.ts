import "server-only";

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ReportArchive } from "../domain/ports";
import { interpretReview, renderReportMarkdown, reportFileName, reportIdentity, type ReviewReport } from "../domain/report";

export class MarkdownReportArchive implements ReportArchive {
  constructor(private readonly directory: string) {}

  list(): readonly ReviewReport[] {
    if (!existsSync(/*turbopackIgnore: true*/ this.directory)) {
      return [];
    }
    const reports: ReviewReport[] = [];
    for (const name of readdirSync(/*turbopackIgnore: true*/ this.directory)) {
      const identity = reportIdentity(name);
      if (!identity) {
        continue;
      }
      try {
        const raw = readFileSync(/*turbopackIgnore: true*/ path.join(this.directory, name), "utf8");
        reports.push(interpretReview(identity.date, identity.lens, raw));
      } catch {
        continue;
      }
    }
    return reports;
  }

  save(report: ReviewReport): void {
    mkdirSync(/*turbopackIgnore: true*/ this.directory, { recursive: true });
    const target = path.join(this.directory, reportFileName(report.date, report.lens));
    const partial = `${target}.partial`;
    writeFileSync(/*turbopackIgnore: true*/ partial, renderReportMarkdown(report), "utf8");
    renameSync(/*turbopackIgnore: true*/ partial, target);
  }
}
