// Normalized domain types — what the rest of the app sees.
// Nothing outside lib/cms ever sees a WordPress shape (workflow/02).

/** One CMS section, not yet narrowed. `BlockRenderer` parses `data` against the
 *  matching block schema (src/blocks/<name>/schema.ts) before rendering. */
export interface CmsBlock {
  /** ACF Flexible Content layout name, e.g. "hero", "card_grid". */
  layout: string;
  data: Record<string, unknown>;
}

/** Per-page SEO, normalized from Yoast (free) via "Add WPGraphQL SEO". Source-agnostic
 *  so the frontend never changes if the source does. All optional — generateMetadata
 *  falls back to the page title + site description + default OG. */
export interface SeoImage {
  sourceUrl: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}
export interface PageSeo {
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: SeoImage | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: SeoImage | null;
  noindex: boolean;
  nofollow: boolean;
  /** Yoast's per-page JSON-LD graph (a JSON string), injected on the page for AI/search. */
  schemaRaw: string | null;
}

export interface Page {
  slug: string;
  title: string;
  blocks: CmsBlock[];
  seo?: PageSeo | null;
}

/** A post reference for the sitemap — slug (→ /blog/<slug>) + last-modified. */
export interface PostRef {
  slug: string;
  uri?: string | null;
  date?: string | null;
  modified?: string | null;
}

/** A post summary for listing blocks (post_grid). Normalized from WPGraphQL. */
export interface PostSummary {
  title: string;
  uri: string;
  date?: string | null;
  excerpt?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
}

// --- Blog (workflow/34). The standard blog every site ships: rendered WP post
// content + category/tag archives, path-based pagination. All WordPress shapes are
// normalized here so the routes/components never see a WPGraphQL edge. ---

/** A taxonomy term (category or tag) as the UI consumes it. `image` is the ACF
 *  category banner (categories only); `count` drives "hide empty" + page math. */
export interface BlogTerm {
  name: string;
  slug: string;
  /** Frontend archive path, e.g. /blog/category/<slug> (we own the route, not WP's uri). */
  href: string;
  count: number;
  description?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
}

/** A post author for the byline + author box. */
export interface BlogAuthor {
  name: string;
  slug: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

/** A post as it appears in a listing/card (index, archives, related). */
export interface PostListItem {
  databaseId: number;
  title: string;
  slug: string;
  /** Frontend permalink — always /blog/<slug> (we own the route). */
  href: string;
  date?: string | null;
  /** Sanitized excerpt HTML (WP returns a <p>-wrapped string). */
  excerpt?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
  author?: { name: string; slug: string } | null;
  categories: { name: string; slug: string; href: string }[];
  /** Whole minutes, ceil(words/200); null when content wasn't fetched. */
  readingTime: number | null;
}

/** A single post for the article page. `contentHtml` is RAW rendered WP HTML —
 *  the PostBody component sanitizes before injecting (same chokepoint as RichText). */
export interface BlogPost {
  databaseId: number;
  title: string;
  slug: string;
  href: string;
  date?: string | null;
  modified?: string | null;
  contentHtml: string;
  image: SeoImage | null;
  author: BlogAuthor | null;
  categories: { name: string; slug: string; href: string }[];
  tags: { name: string; slug: string; href: string }[];
  readingTime: number | null;
  seo?: PageSeo | null;
}

/** A page of posts + the totals needed for path-based pagination + rel=prev/next. */
export interface PaginatedPosts {
  items: PostListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/** A nav link. `children` drives sub-menus (desktop flyout/mega + mobile drill-down);
 *  `description` is the optional one-liner a mega-menu column link can show. */
export interface NavItem {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
}

/** Site chrome (header + footer) — editor-managed in WordPress (menus + ACF options),
 *  normalized from WPGraphQL. Fetched once at the layout level. */
export interface SiteChrome {
  logo: { sourceUrl: string; altText?: string | null } | null;
  headerCta: { label: string; href: string } | null;
  /** Header phone(s): 1 → tel: link, 2+ → a location dropdown. */
  phoneNumbers: { location: string; number: string }[];
  /** Social links (rendered in the footer, and the header when socialInHeader). */
  social: { label: string; href: string }[];
  /** Editor toggle — also show the social icons in the header (desktop). */
  socialInHeader: boolean;
  nav: NavItem[];
  footer: {
    strapline: string | null;
    address: string | null;
    columns: { title: string; links: { label: string; href: string }[] }[];
  };
}
