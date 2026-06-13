import type { Metadata } from "next";
import type { Page, PageSeo, SeoImage } from "./types";
import { siteConfig } from "../../../site.config";

// Per-page Metadata from Yoast SEO (free) via "Add WPGraphQL SEO" (boilerplate §6).
// Precedence: Yoast field → page title / site description → site default. CANONICAL is
// set from the frontend path here (NOT Yoast's, which points at the WP origin); OG/Twitter
// urls resolve against metadataBase (the frontend origin, set in layout.tsx). Yoast's
// JSON-LD (seo.schemaRaw) is injected separately on the page. Used by every content route.

function ogImageMeta(img: SeoImage) {
  return { url: img.sourceUrl, width: img.width ?? undefined, height: img.height ?? undefined, alt: img.altText ?? undefined };
}

function buildRobots(seo: PageSeo | null | undefined): Metadata["robots"] {
  if (!seo?.noindex && !seo?.nofollow) return undefined;
  return { index: !seo?.noindex, follow: !seo?.nofollow };
}

function buildOpenGraph(seo: PageSeo | null | undefined, title: string, description: string, url: string): Metadata["openGraph"] {
  const images = seo?.ogImage ? [ogImageMeta(seo.ogImage)] : undefined;
  return { title, description, url, images, type: "website" };
}

function buildTwitter(seo: PageSeo | null | undefined, title: string, description: string): Metadata["twitter"] {
  const s = seo ?? ({} as PageSeo);
  const img = s.twitterImage ?? s.ogImage ?? null;
  return {
    card: img ? "summary_large_image" : "summary",
    title: s.twitterTitle || title,
    description: s.twitterDescription || description,
    images: img ? [img.sourceUrl] : undefined,
  };
}

export function pageMetadata(page: Page, canonicalPath: string): Metadata {
  const seo = page.seo;
  const title = seo?.title || page.title;
  const description = seo?.description || siteConfig.description;
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: buildRobots(seo),
    openGraph: buildOpenGraph(seo, ogTitle, ogDescription, canonicalPath),
    twitter: buildTwitter(seo, ogTitle, ogDescription),
  };
}
