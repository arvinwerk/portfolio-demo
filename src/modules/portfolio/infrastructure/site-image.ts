import { readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { contentDirectory } from "./content-directory";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export function readSiteImage(
  relativePath: string,
  env: Record<string, string | undefined> = process.env,
): { bytes: Buffer; contentType: string } | undefined {
  const parts = relativePath.split("/").filter((part) => part.length > 0);
  if (parts.length === 0 || parts.some((part) => part === "." || part === ".." || part.includes("\\"))) {
    return undefined;
  }

  const extension = path.extname(parts.at(-1) ?? "").toLowerCase();
  const contentType = IMAGE_TYPES[extension];
  if (!contentType) {
    return undefined;
  }

  const configured = env.CONTENT_DIR?.trim() ?? "";
  const root = configured.length > 0 ? path.join(contentDirectory(env), "images") : path.join(process.cwd(), "public", "images");

  let file: string;
  try {
    const directory = realpathSync(/*turbopackIgnore: true*/ root);
    file = realpathSync(/*turbopackIgnore: true*/ path.join(directory, ...parts));
    const relative = path.relative(directory, file);
    if (relative === "" || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      return undefined;
    }
    const stat = statSync(/*turbopackIgnore: true*/ file);
    if (!stat.isFile() || stat.size > MAX_IMAGE_BYTES) {
      return undefined;
    }
  } catch {
    return undefined;
  }

  return { bytes: readFileSync(/*turbopackIgnore: true*/ file), contentType };
}
