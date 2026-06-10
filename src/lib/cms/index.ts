import { cmsRequest } from "./client";
import { toBlocks } from "./adapters/blocks";
import { PageBySlugDocument, AllPagesDocument } from "./generated/graphql";
import type { Page } from "./types";

// The CMS public API — the ONLY entry point the rest of the app may import
// (lint-enforced, workflow/02). WPGraphQL is the sole content layer (ADR 0013):
// no REST, no fallback content. Missing page → null (caller 404s); malformed
// content fails loud at build/ISR (zod parse in BlockRenderer).

export type { CmsBlock, Page } from "./types";

/** Cache tag convention: revalidateTag("pages") / ("page:<slug>") via /api/revalidate. */
export const PAGES_TAG = "pages";

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
