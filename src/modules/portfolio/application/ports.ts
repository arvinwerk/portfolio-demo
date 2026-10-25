import type { Portfolio } from "../domain/portfolio";

export interface PortfolioRepository {
  load(): Portfolio;
}
