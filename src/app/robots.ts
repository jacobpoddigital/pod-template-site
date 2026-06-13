import type { MetadataRoute } from "next";
import { siteConfig } from "../../site.config";

// Default (production): allow ALL crawlers including AI (training + retrieval) — sites
// exist to be found (workflow/04 §5). Per-client opt-out = add disallow rules here.
//
// STAGING / PREVIEW: any non-production deploy is blocked from indexing so a staging
// frontend never leaks into search (boilerplate §6/§22). "Production" = Vercel
// VERCEL_ENV=production (or, off Vercel, NODE_ENV=production). Force-block anywhere
// with NEXT_PUBLIC_NOINDEX=1.
export default function robots(): MetadataRoute.Robots {
  const isProd =
    process.env.NEXT_PUBLIC_NOINDEX !== "1" &&
    (process.env.VERCEL_ENV
      ? process.env.VERCEL_ENV === "production"
      : process.env.NODE_ENV === "production");

  if (!isProd) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
