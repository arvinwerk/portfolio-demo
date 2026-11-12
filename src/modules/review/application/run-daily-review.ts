import { reviewBrief, type ReviewExcerpt } from "../domain/brief";
import { ReviewModelError, type ReportArchive, type ReviewModel } from "../domain/ports";
import { interpretReview, reportHasFinding, reviewDate, type ReviewReport } from "../domain/report";
import { reviewLenses } from "../domain/lens";

export async function runDailyReview(input: {
  now: Date;
  timeZone?: string;
  excerpts: readonly ReviewExcerpt[];
  model: ReviewModel;
  archive: ReportArchive;
}): Promise<readonly ReviewReport[]> {
  const date = reviewDate(input.now, input.timeZone);
  const prior = input.archive.list();
  const written: ReviewReport[] = [];

  for (const lens of reviewLenses) {
    const brief = reviewBrief({ date, lens, excerpts: input.excerpts, prior });
    let raw = "";
    try {
      raw = await input.model.complete(brief);
    } catch (error) {
      if (!(error instanceof ReviewModelError)) {
        throw error;
      }
    }
    const report = interpretReview(date, lens, raw);
    if (!reportHasFinding(report)) {
      continue;
    }
    input.archive.save(report);
    written.push(report);
  }

  return written;
}
