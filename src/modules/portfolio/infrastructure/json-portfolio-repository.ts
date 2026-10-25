import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import type { PortfolioRepository } from "../application/ports";
import { assemblePortfolio, type Portfolio } from "../domain/portfolio";
import { parseContent } from "./portfolio-document";

function readJson(directory: string, name: string): unknown {
  return JSON.parse(readFileSync(path.join(directory, name), "utf8")) as unknown;
}

export class JsonPortfolioRepository implements PortfolioRepository {
  constructor(private readonly directory = path.join(process.cwd(), "content")) {}

  load(): Portfolio {
    const document = parseContent({
      personal: readJson(this.directory, "personal.json"),
      skills: readJson(this.directory, "skills.json"),
      projects: readJson(this.directory, "projects.json"),
      banners: readJson(this.directory, "banners.json"),
    });

    return assemblePortfolio({
      profile: document.personal,
      skills: document.skills,
      projects: document.projects,
      banners: document.banners,
    });
  }
}
