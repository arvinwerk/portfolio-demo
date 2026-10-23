import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import { parseContent } from "./parse-content";
import type { Content } from "./types";

function readJson(name: string): unknown {
  const file = path.join(process.cwd(), "content", name);
  return JSON.parse(readFileSync(file, "utf8")) as unknown;
}

export function loadContent(): Content {
  return parseContent({
    personal: readJson("personal.json"),
    skills: readJson("skills.json"),
    projects: readJson("projects.json"),
    banners: readJson("banners.json"),
  });
}
