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
} as const;

export type SiteConfig = typeof siteConfig;
