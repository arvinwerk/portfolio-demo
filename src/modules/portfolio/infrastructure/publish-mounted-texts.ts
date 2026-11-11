import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const DOCUMENT_NAMES = ["personal.json", "projects.json", "skills.json", "banners.json"] as const;

export function publishMountedTexts(
  cwd = process.cwd(),
  env: Record<string, string | undefined> = process.env,
): void {
  const marker = path.join(cwd, "content", ".publish");
  const destination = env.CONTENT_DIR?.trim() ?? "";
  if (!existsSync(marker) || destination.length === 0 || !path.isAbsolute(destination)) {
    return;
  }

  mkdirSync(destination, { recursive: true });
  for (const name of DOCUMENT_NAMES) {
    cpSync(path.join(cwd, "content", name), path.join(destination, name));
  }

  const rag = path.join(destination, "rag");
  mkdirSync(rag, { recursive: true });
  for (const name of readdirSync(path.join(cwd, "content", "rag"))) {
    const source = path.join(cwd, "content", "rag", name);
    if (statSync(source).isFile()) {
      cpSync(source, path.join(rag, name));
    }
  }

  rmSync(marker);
}
