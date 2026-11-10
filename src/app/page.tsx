import type { Metadata } from "next";
import { ChatLauncher } from "@/modules/assistant";
import { PortfolioView } from "@/modules/portfolio";
import { loadPortfolioPage } from "@/modules/portfolio/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = loadPortfolioPage(undefined);

  return {
    title: `${profile.fullName} — ${profile.function}`,
    description: `Portfolio van ${profile.fullName}, ${profile.function}. Werk, vaardigheden en een chat over het profiel.`,
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ keywords?: string | string[] }>;
}) {
  const params = await searchParams;
  const model = loadPortfolioPage(params.keywords);
  return (
    <PortfolioView
      model={model}
      chatAction={<ChatLauncher />}
      links={[{ href: "/agents", label: "Agents" }]}
    />
  );
}
