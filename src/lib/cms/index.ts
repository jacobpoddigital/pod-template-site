import { cmsRequest } from "./client";
import { toBlocks } from "./adapters/blocks";
import {
  PageBySlugDocument,
  AllPagesDocument,
  AllPostsDocument,
  RecentPostsDocument,
  SiteChromeDocument,
} from "./generated/graphql";
import type { PageBySlugQuery, SiteChromeQuery } from "./generated/graphql";
import type { Page, PageSeo, PostRef, PostSummary, SiteChrome, NavItem } from "./types";

// The CMS public API — the ONLY entry point the rest of the app may import
// (lint-enforced, workflow/02). WPGraphQL is the sole content layer (ADR 0013):
// no REST, no fallback content. Missing page → null (caller 404s); malformed
// content fails loud at build/ISR (zod parse in BlockRenderer).

export type { CmsBlock, Page, PageSeo, SeoImage, PostRef, PostSummary, SiteChrome, NavItem } from "./types";
export { pageMetadata } from "./metadata";

/** Cache tag convention: revalidateTag("pages") / ("page:<slug>") via /api/revalidate. */
export const PAGES_TAG = "pages";

/** Cache tag for post listings (post_grid). */
export const POSTS_TAG = "posts";

/** Cache tag for the header/footer chrome (menus + options). */
export const CHROME_TAG = "chrome";

// Yoast SEO → normalized PageSeo (null when nothing usable, so callers fall back).
type RawSeo = NonNullable<PageBySlugQuery["page"]>["seo"];
function toSeoImage(img: { sourceUrl?: string | null; altText?: string | null; mediaDetails?: { width?: number | null; height?: number | null } | null } | null | undefined) {
  return img?.sourceUrl
    ? { sourceUrl: img.sourceUrl, altText: img.altText, width: img.mediaDetails?.width, height: img.mediaDetails?.height }
    : null;
}
function toSeo(seo: RawSeo): PageSeo | null {
  if (!seo) return null;
  const ogImage = toSeoImage(seo.opengraphImage);
  // Yoast empties come back as "" — coalesce to null so the frontend fallback chain fires.
  const v = (s?: string | null) => (s ? s : null);
  const result: PageSeo = {
    title: v(seo.title),
    description: v(seo.metaDesc),
    ogTitle: v(seo.opengraphTitle),
    ogDescription: v(seo.opengraphDescription),
    ogImage,
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

/** Fetch a page by slug. Returns null when the page does not exist (caller calls notFound()).
 *  `preview` bypasses the ISR cache for draft preview (boilerplate §4). */
export async function getPage(slug: string, opts: { preview?: boolean } = {}): Promise<Page | null> {
  const data = await cmsRequest(PageBySlugDocument, { slug }, [PAGES_TAG, `page:${slug}`], opts);
  const page = data.page;
  if (!page) return null;
  return {
    slug: page.slug ?? slug,
    title: page.title ?? slug,
    blocks: toBlocks(page.pageFields?.blocks),
    seo: toSeo(page.seo),
  };
}

/** Every published post for the sitemap (boilerplate §6). Frontend URL = the WP `uri`;
 *  needs a matching post route to resolve (template ships pages-only — see docs/seo.md). */
export async function getAllPosts(): Promise<PostRef[]> {
  const data = await cmsRequest(AllPostsDocument, {}, [POSTS_TAG]);
  return (data.posts?.nodes ?? [])
    .filter((n) => n.uri)
    .map((n) => ({ uri: n.uri as string, date: n.date, modified: n.modified }));
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

/** Related posts for an article footer / "you might also like" (boilerplate §18 —
 *  content relationships). The taxonomy pattern: pull recent posts in the SAME
 *  category, drop the current one, take `first`. Category-driven keeps it editor-
 *  controlled with no extra fields; swap `category` for a tag/ACF relationship the
 *  same way when a project needs it. See docs/seo.md §Content relationships. */
export async function getRelatedPosts(opts: {
  category: string | null;
  excludeUri?: string | null;
  first?: number;
}): Promise<PostSummary[]> {
  const want = opts.first ?? 3;
  // Over-fetch by one so removing the current post still leaves `want` results.
  const posts = await getRecentPosts({ first: want + 1, category: opts.category });
  return posts.filter((p) => p.uri !== opts.excludeUri).slice(0, want);
}

// Flat WPGraphQL menu items (parentId) → a nav tree. Empty children are dropped.
interface MenuNode {
  id: string;
  parentId?: string | null;
  label?: string | null;
  uri?: string | null;
  description?: string | null;
}

function buildNavTree(nodes: readonly MenuNode[]): NavItem[] {
  const byId = new Map<string, NavItem>();
  for (const n of nodes)
    byId.set(n.id, {
      label: n.label ?? "",
      href: n.uri ?? "#",
      description: n.description ?? undefined,
      children: [],
    });
  const roots: NavItem[] = [];
  for (const n of nodes) {
    const item = byId.get(n.id)!;
    const parent = n.parentId && n.parentId !== n.id ? byId.get(n.parentId) : undefined;
    if (parent) parent.children!.push(item);
    else roots.push(item);
  }
  // `seen` breaks any cycle a malformed menu might form (CMS input — defensive).
  const clean = (items: NavItem[], seen: Set<NavItem>): NavItem[] =>
    items
      .filter((i) => !seen.has(i))
      .map((i) => {
        seen.add(i);
        const base = { label: i.label, href: i.href, description: i.description };
        return i.children && i.children.length ? { ...base, children: clean(i.children, seen) } : base;
      });
  return clean(roots, new Set());
}

// Small normalizers keep getSiteChrome under the complexity bar.
type ChromeOptions = SiteChromeQuery["siteOptions"];

function toLogo(o: ChromeOptions): SiteChrome["logo"] {
  return o?.logo?.sourceUrl ? { sourceUrl: o.logo.sourceUrl, altText: o.logo.altText } : null;
}
function toHeaderCta(o: ChromeOptions): SiteChrome["headerCta"] {
  return o?.headerCtaLabel && o?.headerCtaUrl ? { label: o.headerCtaLabel, href: o.headerCtaUrl } : null;
}
function toSocial(o: ChromeOptions): SiteChrome["social"] {
  return (o?.social ?? []).map((s) => ({ label: s.label ?? "", href: s.url ?? "#" }));
}
function toPhones(o: ChromeOptions): SiteChrome["phoneNumbers"] {
  return (o?.phoneNumbers ?? []).filter((p) => p?.number).map((p) => ({ location: p.location ?? "", number: p.number ?? "" }));
}
function toColumns(tree: NavItem[]): SiteChrome["footer"]["columns"] {
  return tree.map((c) => ({
    title: c.label,
    links: (c.children ?? []).map((l) => ({ label: l.label, href: l.href })),
  }));
}

/** Header + footer chrome, editor-managed in WordPress (menus + ACF options). */
export async function getSiteChrome(): Promise<SiteChrome> {
  const data = await cmsRequest(SiteChromeDocument, {}, [CHROME_TAG]);
  const o = data.siteOptions;
  return {
    logo: toLogo(o),
    headerCta: toHeaderCta(o),
    phoneNumbers: toPhones(o),
    social: toSocial(o),
    socialInHeader: Boolean(o?.socialInHeader),
    nav: buildNavTree(data.primary?.nodes ?? []),
    footer: {
      strapline: o?.strapline ?? null,
      address: o?.address ?? null,
      columns: toColumns(buildNavTree(data.footer?.nodes ?? [])),
    },
  };
}
