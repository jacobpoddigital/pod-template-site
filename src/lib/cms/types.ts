// Normalized domain types — what the rest of the app sees.
// Nothing outside lib/cms ever sees a WordPress shape (workflow/02).

/** One CMS section, not yet narrowed. `BlockRenderer` parses `data` against the
 *  matching block schema (src/blocks/<name>/schema.ts) before rendering. */
export interface CmsBlock {
  /** ACF Flexible Content layout name, e.g. "hero", "card_grid". */
  layout: string;
  data: Record<string, unknown>;
}

export interface Page {
  slug: string;
  title: string;
  blocks: CmsBlock[];
}

/** A post summary for listing blocks (post_grid). Normalized from WPGraphQL. */
export interface PostSummary {
  title: string;
  uri: string;
  date?: string | null;
  excerpt?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
}

/** A nav link, with optional children for the mobile drill-down menu. */
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

/** Site chrome (header + footer) — editor-managed in WordPress (menus + ACF options),
 *  normalized from WPGraphQL. Fetched once at the layout level. */
export interface SiteChrome {
  logo: { sourceUrl: string; altText?: string | null } | null;
  headerCta: { label: string; href: string } | null;
  nav: NavItem[];
  footer: {
    strapline: string | null;
    address: string | null;
    columns: { title: string; links: { label: string; href: string }[] }[];
    social: { label: string; href: string }[];
  };
}
