import { cmsRequest } from "./client";
import { toBlocks } from "./adapters/blocks";
import { PageBySlugDocument, AllPagesDocument, RecentPostsDocument } from "./generated/graphql";
import type { Page, PostSummary } from "./types";

// The CMS public API — the ONLY entry point the rest of the app may import
// (lint-enforced, workflow/02). WPGraphQL is the sole content layer (ADR 0013):
// no REST, no fallback content. Missing page → null (caller 404s); malformed
// content fails loud at build/ISR (zod parse in BlockRenderer).

export type { CmsBlock, Page, PostSummary } from "./types";

/** Cache tag convention: revalidateTag("pages") / ("page:<slug>") via /api/revalidate. */
export const PAGES_TAG = "pages";

/** Cache tag for post listings (post_grid). */
export const POSTS_TAG = "posts";

/** Fetch a page by slug. Returns null when the page does not exist (caller calls notFound()). */
export async function getPage(slug: string): Promise<Page | null> {
  const data = await cmsRequest(PageBySlugDocument, { slug }, [PAGES_TAG, `page:${slug}`]);
  const page = data.page;
  if (!page) return null;
  return {
    slug: page.slug ?? slug,
    title: page.title ?? slug,
    blocks: toBlocks(page.pageFields?.blocks),
  };
}

/** List published pages (slugs + titles) — drives generateStaticParams + the sitemap. */
export async function getPages(): Promise<Page[]> {
  const data = await cmsRequest(AllPagesDocument, {}, [PAGES_TAG]);
  return (data.pages?.nodes ?? []).map((node) => ({
    slug: node.slug ?? "",
    title: node.title ?? "",
    blocks: [],
  }));
}

/** Recent posts for the post_grid listing block. Optional category filter. */
export async function getRecentPosts(opts: { first?: number; category?: string | null }): Promise<PostSummary[]> {
  const data = await cmsRequest(
    RecentPostsDocument,
    { first: opts.first ?? 3, category: opts.category ?? null },
    [POSTS_TAG],
  );
  return (data.posts?.nodes ?? []).map((n) => {
    const img = n.featuredImage?.node;
    return {
      title: n.title ?? "",
      uri: n.uri ?? "#",
      date: n.date,
      excerpt: n.excerpt,
      image: img?.sourceUrl ? { sourceUrl: img.sourceUrl, altText: img.altText } : null,
    };
  });
}
