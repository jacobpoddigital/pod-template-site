import { getAllFallbackPages, getFallbackPage } from "./fallback";
import { mapPage } from "./wordpress/mappers";
import { CmsError, wpFetch } from "./wordpress/fetch";
import { wpPagesResponseSchema } from "./wordpress/schemas";
import type { Page } from "./types";

// The CMS public API — the ONLY entry point the rest of the app may import
// (lint-enforced, workflow/02). Returns normalized domain types.

export type { CmsBlock, Page } from "./types";

/** Cache tag convention: revalidateTag("pages") / ("page:<slug>") via /api/revalidate. */
export const PAGES_TAG = "pages";

/**
 * Fetch a page by slug. WP absent/unreachable → fallback content (resilience:
 * "WordPress down ≠ site down"). Malformed WP content → zod throws LOUDLY at
 * build/ISR time — bad content must never silently render wrong.
 */
export async function getPage(slug: string): Promise<Page> {
  try {
    const raw = await wpFetch(
      `/wp/v2/pages?slug=${encodeURIComponent(slug)}&acf_format=standard`,
      [PAGES_TAG, `page:${slug}`],
    );
    const pages = wpPagesResponseSchema.parse(raw);
    const first = pages[0];
    if (!first) throw new CmsError(`No WP page with slug "${slug}"`, "expected");
    return mapPage(first);
  } catch (error) {
    if (error instanceof CmsError && error.kind === "expected") {
      const fallback = getFallbackPage(slug);
      if (fallback) {
        console.warn(`[cms] ${error.message} — using fallback content for "${slug}"`);
        return fallback;
      }
    }
    throw error;
  }
}

/**
 * List all published pages (slugs + titles) — drives generateStaticParams and
 * the sitemap. WP absent → fallback page list, same resilience contract as
 * getPage. Published-only; WP origin stays the single content authority.
 */
export async function getPages(): Promise<Page[]> {
  try {
    const raw = await wpFetch(
      "/wp/v2/pages?status=publish&per_page=100&acf_format=standard",
      [PAGES_TAG],
    );
    return wpPagesResponseSchema.parse(raw).map(mapPage);
  } catch (error) {
    if (error instanceof CmsError && error.kind === "expected") {
      console.warn(`[cms] ${error.message} — using fallback page list`);
      return getAllFallbackPages();
    }
    throw error;
  }
}
