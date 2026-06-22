// Build-identity config — nothing client-content here. The editor-managed CHROME
// (logo, nav, footer columns, social, strapline, address, header CTA) now comes
// from WordPress (menus + the "Site Options" ACF page) via getSiteChrome(); see
// src/lib/cms. Rebrand/reuse = edit these files + the WP menus/options.
// TEMPLATE: every value below is a placeholder — set during workflow/01 Phase 4.

export const siteConfig = {
  /** Stable project slug — matches POD_PROJECT_ID and the repo name minus `pod-site-` (workflow/15 §3). */
  projectId: "CHANGE-ME",
  name: "Client Name",
  description: "One-sentence value proposition — becomes the default meta description.",
  /** Canonical FRONTEND origin. All canonical/og/sitemap URLs use this, never the WP origin. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_GB",
  /** Opt-in WooCommerce storefront chrome (header cart + search). false = brochure site —
   *  commerce-free sites render no cart/search chrome. The /shop, /cart, /checkout routes
   *  exist regardless but are inert without a Woo backend (commerceConfigured()). Set true
   *  per ecom client. The checkout + account areas have their own env gates (config.ts). */
  commerce: false,
  footer: {
    /** Shown in the © line; the rest of the footer is editor-managed in WP. */
    company: "Pod Digital",
    /** Legal links in the footer bottom bar (rarely change → kept in code). */
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  /** Dismissible announcement strip above the header. null = no bar.
   *  TEMPLATE: set per client, e.g. { text: "Now booking Q3 projects", href: "/contact", linkLabel: "Enquire" }. */
  announcement: null as null | { text: string; href?: string; linkLabel?: string },
  /** Sticky bottom CTA bar on mobile (< lg) — phone + primary CTA from WP chrome.
   *  Best-evidenced mobile conversion pattern (+8–31%). Set false to disable. */
  stickyMobileCta: true,
  /** Organisation identity for the site-wide `Organization` JSON-LD (E-E-A-T §B1,
   *  workflow/34). Editor-managed fields (logo, social→sameAs, phone, address) come
   *  from WP Site Options (SiteChrome) — set ONLY the stable legal identity here.
   *  TEMPLATE: fill per client at workflow/01 Phase 4. All optional; null = omitted. */
  organization: {
    /** schema.org @type. "Organization" default; LocalBusiness subtypes are Phase 3. */
    type: "Organization",
    /** Registered legal name, if different from the trading name (footer.company). */
    legalName: null as string | null,
    /** ISO date, e.g. "2014-03-01". */
    foundingDate: null as string | null,
    vatId: null as string | null,
    taxId: null as string | null,
    /** Public contact email for the schema contactPoint. */
    email: null as string | null,
    contactType: "customer service",
    /** Founders → schema `Person` (name + optional profile URL + sameAs profiles). */
    founders: [] as { name: string; url?: string; sameAs?: string[] }[],
    /** Overrides — leave empty to use WP Site Options (logo / social / address). */
    logoUrl: null as string | null,
    sameAs: [] as string[],
    addressText: null as string | null,
  },
  /** The standard blog (workflow/34). Mounted at /blog (see BLOG_BASE in lib/cms).
   *  TEMPLATE: set title/intro per client; drop a bannerImage URL for the index hero. */
  blog: {
    /** Posts per page for the path-based /blog/page/[n] pagination. */
    perPage: 12,
    /** Index hero heading + standfirst. */
    title: "Insights",
    intro: "Practical guides on SEO, paid media, and building websites that convert.",
    /** Optional site-wide blog banner image (index + tag archives; a category's own
     *  ACF banner image overrides it on its archive). null = clean muted band. */
    bannerImage: null as string | null,
    /** Show the newest post as a featured article on the index (Great White port). */
    featured: true,
  },
  /** The example CUSTOM POST TYPE (case_study). Mounted at /case-studies (see
   *  CASE_STUDIES_BASE in lib/cms). The template ships this CPT as the reference
   *  pattern — keep, rename, or delete per client.
   *  TEMPLATE: set title/intro per client. */
  caseStudies: {
    /** Index hero heading + standfirst. */
    title: "Case studies",
    intro: "Real outcomes from real engagements — the measurement, the build, and the numbers that moved.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
