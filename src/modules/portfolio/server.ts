import "server-only";

import { composePortfolioPage, type PortfolioPage } from "./application/compose-portfolio-page";
import { JsonPortfolioRepository } from "./infrastructure/json-portfolio-repository";

export function loadPortfolioPage(keywords: string | string[] | undefined, now = new Date()): PortfolioPage {
  return composePortfolioPage(new JsonPortfolioRepository().load(), { keywords, now });
}
