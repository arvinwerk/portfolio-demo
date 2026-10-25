import { ChatLauncher } from "@/modules/assistant";
import { PortfolioView } from "@/modules/portfolio";
import { loadPortfolioPage } from "@/modules/portfolio/server";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ keywords?: string | string[] }>;
}) {
  const params = await searchParams;
  const model = loadPortfolioPage(params.keywords);
  return <PortfolioView model={model} chatAction={<ChatLauncher />} />;
}
