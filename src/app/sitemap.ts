import type { MetadataRoute } from "next";
import { loadPortfolioPage } from "@/modules/portfolio/server";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const { profile } = loadPortfolioPage(undefined);

  return [
    {
      url: profile.portfolioUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
