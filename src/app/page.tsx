import type { Metadata } from "next";
import { ChatLauncher } from "@/modules/assistant";
import { PortfolioView } from "@/modules/portfolio";
import { describePortfolio, loadPortfolioPage, portfolioStructuredData } from "@/modules/portfolio/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const discovery = describePortfolio(loadPortfolioPage(undefined).profile);

  return {
    metadataBase: new URL(new URL(discovery.url).origin),
    title: discovery.title,
    description: discovery.description,
    alternates: { canonical: discovery.url },
    robots: { index: true, follow: true },
    openGraph: {
      title: discovery.title,
      description: discovery.description,
      url: discovery.url,
      locale: "nl_NL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: discovery.title,
      description: discovery.description,
      images: ["/opengraph-image"],
    },
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: portfolioStructuredData(model.profile) }} />
      <PortfolioView
        model={model}
        chatAction={<ChatLauncher />}
        links={[{ href: "/agents", label: "Agents" }]}
      />
    </>
  );
}
