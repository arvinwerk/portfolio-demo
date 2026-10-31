import { realpathSync, statSync } from "node:fs";
import path from "node:path";

export class ContentDirectoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentDirectoryError";
  }
}

export function contentDirectory(env: Record<string, string | undefined> = process.env): string {
  const configured = env.CONTENT_DIR?.trim() ?? "";
  if (configured.length === 0) {
    return path.join(process.cwd(), "content");
  }
  if (!path.isAbsolute(configured)) {
    throw new ContentDirectoryError("CONTENT_DIR moet een absoluut pad zijn.");
  }

  let resolved: string;
  try {
    resolved = realpathSync(/*turbopackIgnore: true*/ configured);
  } catch {
    throw new ContentDirectoryError("CONTENT_DIR is niet beschikbaar.");
  }
  if (!statSync(/*turbopackIgnore: true*/ resolved).isDirectory()) {
    throw new ContentDirectoryError("CONTENT_DIR moet een map zijn.");
  }
  return resolved;
}
