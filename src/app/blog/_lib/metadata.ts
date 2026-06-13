import type { Metadata } from "next";
import { pageMetadata, type BlogPost } from "@/lib/cms";
import { siteConfig } from "../../../../site.config";

// Blog metadata (workflow/33). SEO note: each paginated page gets a SELF-referencing
// canonical (NOT canonical-to-page-1 — that de-indexes deeper pages and hides their
// posts) and a "Page N" title so they aren't duplicate titles. rel=prev/next is no
// longer an indexing signal (Google retired it), so we rely on self-canonicals +
// crawlable <a href> pagination links.

/** A post's Metadata — reuses the Yoast→PageSeo mapper (title/desc/OG/Twitter/robots,
 *  frontend canonical). Falls back to the post title + site description. */
export function postMetadata(post: BlogPost): Metadata {
  return pageMetadata({ slug: post.slug, title: post.title, blocks: [], seo: post.seo }, post.href);
}

/** An archive/index page's Metadata. `path` is the page-1 base (e.g. /blog or
 *  /blog/category/seo); page>1 appends /page/N to both the title and the canonical. */
export function archiveMetadata(opts: {
  title: string;
  description?: string | null;
  path: string;
  page: number;
}): Metadata {
  const title = opts.page > 1 ? `${opts.title} – Page ${opts.page}` : opts.title;
  const canonical = opts.page > 1 ? `${opts.path}/page/${opts.page}` : opts.path;
  const description = opts.description || siteConfig.description;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}
