import "server-only";

import { composePortfolioPage, type PortfolioPage } from "./application/compose-portfolio-page";
import { contentDirectory } from "./infrastructure/content-directory";
import { JsonPortfolioRepository } from "./infrastructure/json-portfolio-repository";
import { readSiteImage } from "./infrastructure/site-image";

export { readSiteImage };

export function loadPortfolioPage(
  keywords: string | string[] | undefined,
  now = new Date(),
  selection?: { lens?: string | string[]; scenario?: string | string[] },
): PortfolioPage {
  return composePortfolioPage(new JsonPortfolioRepository(contentDirectory()).load(), {
    keywords,
    now,
    lens: selection?.lens,
    scenario: selection?.scenario,
  });
}
