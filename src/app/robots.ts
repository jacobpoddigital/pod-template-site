import type { MetadataRoute } from "next";
import { siteConfig } from "../../site.config";

// Default: allow ALL crawlers including AI (training + retrieval) — sites exist
// to be found (workflow/04 §5). Per-client opt-out = add disallow rules here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
