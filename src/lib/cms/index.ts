import { cmsRequest } from "./client";
import { toBlocks } from "./adapters/blocks";
import {
  PageBySlugDocument,
  AllPagesDocument,
  AllPostsDocument,
  RecentPostsDocument,
  SiteChromeDocument,
} from "./generated/graphql";
import type { SiteChromeQuery } from "./generated/graphql";
import { toSeo } from "./seo";
import { PAGES_TAG, POSTS_TAG, CHROME_TAG } from "./cache-tags";
import type { Page, PostRef, PostSummary, SiteChrome, NavItem } from "./types";

// The CMS public API — the ONLY entry point the rest of the app may import
// (lint-enforced, workflow/02). WPGraphQL is the sole content layer (ADR 0013):
// no REST, no fallback content. Missing page → null (caller 404s); malformed
// content fails loud at build/ISR (zod parse in BlockRenderer).

export type {
  CmsBlock,
  Page,
  PageSeo,
  SeoImage,
  PostRef,
  PostSummary,
  SiteChrome,
  NavItem,
  BlogTerm,
  BlogAuthor,
  PostListItem,
  BlogPost,
  PaginatedPosts,
  CaseStudyListItem,
  CaseStudy,
  CaseStudyMetric,
  PaginatedCaseStudies,
} from "./types";
export { pageMetadata } from "./metadata";

// On-demand ISR cache tags — the public API the /api/revalidate route imports.
export { PAGES_TAG, POSTS_TAG, CHROME_TAG, CASE_STUDIES_TAG } from "./cache-tags";

// The standard blog (workflow/34) — implemented in ./blog (cms-internal), surfaced here.
export {
  BLOG_BASE,
  BLOG_PER_PAGE,
  getBlogPosts,
  getRelatedBlogPosts,
  getMoreFromAuthor,
  getPostSlugs,
  getPost,
  getCategories,
  getCategoryBySlug,
  getTags,
  getTagBySlug,
  getAuthorBySlug,
  getAuthorSlugs,
} from "./blog";
export type { BlogPostsOpts } from "./blog";

// The example CUSTOM POST TYPE (case_study) — implemented in ./case-studies
// (cms-internal), surfaced here. Mirrors the blog surface so a CPT is a copy-paste
// away: register the CPT + ACF group WP-side, add queries, clone this file.
export {
  CASE_STUDIES_BASE,
  CASE_STUDIES_PER_PAGE,
  getCaseStudies,
  getCaseStudySlugs,
  getCaseStudy,
} from "./case-studies";
export type { CaseStudiesOpts } from "./case-studies";

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

/** Every published post for the sitemap (boilerplate §6). Posts resolve at the
 *  frontend route /blog/<slug> (workflow/34), so callers build from `slug`. */
export async function getAllPosts(): Promise<PostRef[]> {
  const data = await cmsRequest(AllPostsDocument, {}, [POSTS_TAG]);
  return (data.posts?.nodes ?? [])
    .filter((n) => n.slug)
    .map((n) => ({ slug: n.slug as string, uri: n.uri, date: n.date, modified: n.modified }));
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
