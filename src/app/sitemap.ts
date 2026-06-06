import type { MetadataRoute } from "next";
import { getPages } from "@/lib/cms";
import { siteConfig } from "../../site.config";

// The ONLY sitemap — Yoast's stays disabled on the WP origin (workflow/04 §3).
// CMS-driven: every published page, frontend URLs only.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getPages();
  return pages.map((page) => ({
    url: page.slug === "home" ? siteConfig.url : `${siteConfig.url}/${page.slug}`,
    changeFrequency: "weekly" as const,
    priority: page.slug === "home" ? 1 : 0.7,
  }));
}
