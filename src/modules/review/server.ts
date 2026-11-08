import "server-only";

import { composeAgentsPage, type AgentsPage } from "./application/compose-agents-page";
import { runDailyReview } from "./application/run-daily-review";
import type { ReviewReport } from "./domain/report";
import { MarkdownReportArchive } from "./infrastructure/markdown-report-archive";
import { createOllamaReviewModel, readOllamaTarget } from "./infrastructure/ollama-review-model";
import { loadReviewExcerpts } from "./infrastructure/public-sources";
import { reviewsDirectory } from "./infrastructure/reviews-directory";

export function loadAgentsPage(env: Record<string, string | undefined> = process.env): AgentsPage {
  return composeAgentsPage(new MarkdownReportArchive(reviewsDirectory(env)).list());
}

export async function runDailyReviewFromEnvironment(
  env: Record<string, string | undefined> = process.env,
  now = new Date(),
): Promise<readonly ReviewReport[]> {
  const source = env.REVIEW_SOURCE_DIR?.trim() || process.cwd();
  return runDailyReview({
    now,
    excerpts: loadReviewExcerpts(source),
    model: createOllamaReviewModel(readOllamaTarget(env)),
    archive: new MarkdownReportArchive(reviewsDirectory(env)),
  });
}
