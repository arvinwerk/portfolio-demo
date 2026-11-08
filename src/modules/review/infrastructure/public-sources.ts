import "server-only";

import { realpathSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { ReviewExcerpt } from "../domain/brief";
import { clip } from "../domain/report";
import { sanitizePublicText } from "../domain/sanitize";

const catalog: readonly { relative: string; audience: ReviewExcerpt["audience"] }[] = [
  { relative: "src/app/layout.tsx", audience: "shared" },
  { relative: "src/app/page.tsx", audience: "shared" },
  { relative: "src/modules/portfolio/interface/portfolio-view.tsx", audience: "shared" },
  { relative: "content/personal.json", audience: "shared" },
  { relative: "content/projects.json", audience: "shared" },
  { relative: "src/app/globals.css", audience: "interface" },
  { relative: "src/modules/portfolio/interface/site-header.tsx", audience: "interface" },
  { relative: "src/modules/portfolio/interface/work-explorer.tsx", audience: "interface" },
  { relative: "src/modules/assistant/interface/chat-launcher.tsx", audience: "interface" },
  { relative: "src/modules/portfolio/interface/about.tsx", audience: "content" },
  { relative: "src/modules/portfolio/interface/project-list.tsx", audience: "content" },
  { relative: "content/rag/profile.txt", audience: "content" },
  { relative: "content/skills.json", audience: "content" },
  { relative: "src/modules/portfolio/interface/site-footer.tsx", audience: "findability" },
  { relative: "src/modules/portfolio/interface/banner.tsx", audience: "findability" },
  { relative: "content/banners.json", audience: "findability" },
];

export class ReviewSourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewSourceError";
  }
}

export function loadReviewExcerpts(root = process.cwd()): readonly ReviewExcerpt[] {
  const resolvedRoot = resolveDirectory(root);
  const excerpts: ReviewExcerpt[] = [];
  for (const entry of catalog) {
    const text = readAllowed(resolvedRoot, entry.relative);
    if (text === undefined) {
      continue;
    }
    excerpts.push({
      label: entry.relative,
      audience: entry.audience,
      text: clip(sanitizePublicText(text), 900),
    });
  }
  return excerpts;
}

function resolveDirectory(root: string): string {
  let resolved: string;
  try {
    resolved = realpathSync(root);
  } catch {
    throw new ReviewSourceError("REVIEW_SOURCE_DIR is niet beschikbaar.");
  }
  if (!statSync(resolved).isDirectory()) {
    throw new ReviewSourceError("REVIEW_SOURCE_DIR moet een map zijn.");
  }
  return resolved;
}

function readAllowed(root: string, relative: string): string | undefined {
  if (relative.includes("..") || path.isAbsolute(relative)) {
    return undefined;
  }
  const full = path.resolve(root, relative);
  let resolved: string;
  try {
    resolved = realpathSync(full);
  } catch {
    return undefined;
  }
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return undefined;
  }
  return readFileSync(resolved, "utf8");
}
