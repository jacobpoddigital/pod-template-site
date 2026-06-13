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

/** A post reference for the sitemap — frontend permalink + last-modified. */
export interface PostRef {
  uri: string;
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
