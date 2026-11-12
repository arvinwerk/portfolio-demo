import "server-only";

import { realpathSync, statSync } from "node:fs";
import path from "node:path";

export class ReviewDirectoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewDirectoryError";
  }
}

export function reviewsDirectory(env: Record<string, string | undefined> = process.env): string {
  return path.join(contentRoot(env), "reviews");
}

function contentRoot(env: Record<string, string | undefined>): string {
  const configured = env.CONTENT_DIR?.trim() ?? "";
  if (configured.length === 0) {
    return path.join(process.cwd(), "content");
  }
  if (!path.isAbsolute(configured)) {
    throw new ReviewDirectoryError("CONTENT_DIR moet een absoluut pad zijn.");
  }

  let resolved: string;
  try {
    resolved = realpathSync(/*turbopackIgnore: true*/ configured);
  } catch {
    throw new ReviewDirectoryError("CONTENT_DIR is niet beschikbaar.");
  }
  if (!statSync(/*turbopackIgnore: true*/ resolved).isDirectory()) {
    throw new ReviewDirectoryError("CONTENT_DIR moet een map zijn.");
  }
  return resolved;
}
