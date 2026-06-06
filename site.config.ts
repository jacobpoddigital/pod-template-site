// All client-specific configuration lives here, in app/, or in src/styles/theme.css —
// nothing client-specific anywhere else (workflow/02). Rebrand/reuse = edit these files only.
// TEMPLATE: every value below is a placeholder — set during workflow/01 Phase 4.

export const siteConfig = {
  /** Stable project slug — matches POD_PROJECT_ID and the repo name minus `pod-site-` (workflow/15 §3). */
  projectId: "CHANGE-ME",
  name: "Client Name",
  description: "One-sentence value proposition — becomes the default meta description.",
  /** Canonical FRONTEND origin. All canonical/og/sitemap URLs use this, never the WP origin. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_GB",
  nav: [
    { label: "Home", href: "/" },
    { label: "What we do", href: "/#services" },
    { label: "Contact", href: "/#contact" },
  ],
  footer: {
    company: "Pod Digital",
    strapline: "AI-built, human-reviewed websites.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
