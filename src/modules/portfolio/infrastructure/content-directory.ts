import { readFileSync, realpathSync, statSync } from "node:fs";
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

export function readContentDocument(directory: string, name: string): string {
  if (name !== path.basename(name)) {
    throw new ContentDirectoryError("Een contentbestand moet in de contentmap blijven.");
  }

  let root: string;
  try {
    root = realpathSync(/*turbopackIgnore: true*/ directory);
  } catch (error) {
    if (isMissing(error)) {
      throw error;
    }
    throw new ContentDirectoryError("Een contentbestand is niet beschikbaar.");
  }

  let file: string;
  try {
    file = realpathSync(/*turbopackIgnore: true*/ path.join(root, name));
  } catch (error) {
    if (isMissing(error)) {
      throw error;
    }
    throw new ContentDirectoryError("Een contentbestand is niet beschikbaar.");
  }

  const relative = path.relative(root, file);
  if (relative === "" || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new ContentDirectoryError("Een contentbestand moet in de contentmap blijven.");
  }

  return readFileSync(/*turbopackIgnore: true*/ file, "utf8");
}

function isMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "ENOENT";
}
