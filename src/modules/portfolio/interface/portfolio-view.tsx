import type { ReactNode } from "react";
import type { PortfolioPage } from "../application/compose-portfolio-page";
import { Experience } from "./experience";

export function PortfolioView({
  model,
  chatAction,
  studyBench,
}: {
  model: PortfolioPage;
  chatAction?: ReactNode;
  studyBench?: ReactNode;
}) {
  return <Experience model={model} chatAction={chatAction} studyBench={studyBench} />;
}
