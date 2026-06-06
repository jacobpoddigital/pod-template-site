import type { MetadataRoute } from "next";
import { siteConfig } from "../../site.config";

// The ONLY sitemap — Yoast's stays disabled on the WP origin (workflow/04 §3).
// Single page for the MVP; extend from the CMS page list when multi-page lands.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
