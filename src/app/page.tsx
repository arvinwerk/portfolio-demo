import type { Metadata } from "next";
import { ChatLauncher, StudyBench } from "@/modules/assistant";
import { PortfolioView } from "@/modules/portfolio";
import { loadPortfolioPage } from "@/modules/portfolio/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = loadPortfolioPage(undefined);

  return {
    title: `${profile.fullName} — ${profile.function}`,
    description: `Demoportfolio van ${profile.fullName}, een verzonnen ${profile.function.toLowerCase()}. Werk, vaardigheden en een chat over het profiel.`,
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ keywords?: string | string[]; lens?: string | string[]; scenario?: string | string[]; minuut?: string | string[] }>;
}) {
  const params = await searchParams;
  const model = loadPortfolioPage(params.keywords, new Date(), {
    lens: params.lens,
    scenario: params.scenario,
    minute: params.minuut,
  });
  return <PortfolioView model={model} chatAction={<ChatLauncher />} studyBench={<StudyBench />} />;
}
