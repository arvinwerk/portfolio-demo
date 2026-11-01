import "server-only";

import type { PortfolioRepository } from "../application/ports";
import { assemblePortfolio, type Portfolio } from "../domain/portfolio";
import { contentDirectory, readContentDocument } from "./content-directory";
import { parseContent } from "./portfolio-document";

function readJson(directory: string, name: string): unknown {
  return JSON.parse(readContentDocument(directory, name)) as unknown;
}

export class JsonPortfolioRepository implements PortfolioRepository {
  constructor(private readonly directory = contentDirectory()) {}

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
