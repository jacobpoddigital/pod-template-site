import type { Metadata } from "next";
import { pageMetadata, type CaseStudy } from "@/lib/cms";

// Case-study metadata (the example CPT) — reuses the shared Yoast→PageSeo mapper
// (title/desc/OG/Twitter/robots, frontend canonical), exactly like the blog's
// postMetadata. Falls back to the entry's summary then the title + site description.

/** A single case study's Metadata. */
export function caseStudyMetadata(caseStudy: CaseStudy): Metadata {
  const seo = caseStudy.seo ?? null;
  // Seed the summary as the description fallback so an entry without Yoast meta still
  // gets a meaningful description (pageMetadata falls back to the page title otherwise).
  const withSummary = seo ?? (caseStudy.summary ? { ...EMPTY_SEO, description: caseStudy.summary } : null);
  return pageMetadata(
    { slug: caseStudy.slug, title: caseStudy.title, blocks: [], seo: withSummary },
    caseStudy.href,
  );
}

const EMPTY_SEO = {
  title: null,
  description: null,
  ogTitle: null,
  ogDescription: null,
  ogImage: null,
  twitterTitle: null,
  twitterDescription: null,
  twitterImage: null,
  noindex: false,
  nofollow: false,
  schemaRaw: null,
} as const;
