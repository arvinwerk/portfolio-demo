import "server-only";

import { composePortfolioPage, type PortfolioPage } from "./application/compose-portfolio-page";
import { describePortfolio, portfolioStructuredData } from "./application/portfolio-discovery";
import { contentDirectory } from "./infrastructure/content-directory";
import { JsonPortfolioRepository } from "./infrastructure/json-portfolio-repository";
import { readSiteImage } from "./infrastructure/site-image";

export { describePortfolio, portfolioStructuredData, readSiteImage };

export function loadPortfolioPage(keywords: string | string[] | undefined, now = new Date()): PortfolioPage {
  return composePortfolioPage(new JsonPortfolioRepository(contentDirectory()).load(), { keywords, now });
}
