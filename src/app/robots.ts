import type { MetadataRoute } from "next";
import { loadPortfolioPage } from "@/modules/portfolio/server";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const { profile } = loadPortfolioPage(undefined);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/agents", "/api/"],
    },
    sitemap: new URL("/sitemap.xml", profile.portfolioUrl).toString(),
  };
}
