import { runDailyReviewFromEnvironment } from "./modules/review/server";

const reports = await runDailyReviewFromEnvironment();
for (const report of reports) {
  console.log(`${report.date} ${report.lens} ${report.suggestions.length}`);
}
