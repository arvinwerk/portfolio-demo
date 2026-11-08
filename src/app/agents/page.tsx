import type { Metadata } from "next";
import { AgentsView } from "@/modules/review";
import { loadAgentsPage } from "@/modules/review/server";
import { loadPortfolioPage } from "@/modules/portfolio/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agents",
  description: "Dagelijkse voorstellen over gebruik, content en vindbaarheid.",
  robots: { index: false, follow: false },
};

export default function AgentsPage() {
  const model = loadAgentsPage();
  const { profile } = loadPortfolioPage(undefined);
  return <AgentsView model={model} siteName={profile.fullName} />;
}
