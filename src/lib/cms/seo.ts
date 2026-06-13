import type { PageSeo } from "./types";

// Yoast SEO → normalized PageSeo (cms-internal so pages AND posts reuse it). Null when
// nothing usable, so callers fall back to title/site defaults. Structural input type
// (not a generated query type) so any Yoast selection set with these fields maps.

interface RawSeoImage {
  sourceUrl?: string | null;
  altText?: string | null;
  mediaDetails?: { width?: number | null; height?: number | null } | null;
}
export interface RawSeoFields {
  title?: string | null;
  metaDesc?: string | null;
  opengraphTitle?: string | null;
  opengraphDescription?: string | null;
  opengraphImage?: RawSeoImage | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: RawSeoImage | null;
  metaRobotsNoindex?: string | null;
  metaRobotsNofollow?: string | null;
  schema?: { raw?: string | null } | null;
}
export type RawSeo = RawSeoFields | null | undefined;

function toSeoImage(img: RawSeoImage | null | undefined) {
  return img?.sourceUrl
    ? { sourceUrl: img.sourceUrl, altText: img.altText, width: img.mediaDetails?.width, height: img.mediaDetails?.height }
    : null;
}

export function toSeo(seo: RawSeo): PageSeo | null {
  if (!seo) return null;
  // Yoast empties come back as "" — coalesce to null so the frontend fallback chain fires.
  const v = (s?: string | null) => (s ? s : null);
  const result: PageSeo = {
    title: v(seo.title),
    description: v(seo.metaDesc),
    ogTitle: v(seo.opengraphTitle),
    ogDescription: v(seo.opengraphDescription),
    ogImage: toSeoImage(seo.opengraphImage),
    twitterTitle: v(seo.twitterTitle),
    twitterDescription: v(seo.twitterDescription),
    twitterImage: toSeoImage(seo.twitterImage),
    // Yoast returns "noindex"/"index" (and "nofollow"/"follow") as strings.
    noindex: seo.metaRobotsNoindex === "noindex",
    nofollow: seo.metaRobotsNofollow === "nofollow",
    schemaRaw: v(seo.schema?.raw),
  };
  const hasAny = Object.values(result).some((x) => x !== null && x !== false);
  return hasAny ? result : null;
}
