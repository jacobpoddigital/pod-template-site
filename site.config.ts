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
  /** Brand logo image. `src` empty → the name wordmark. Local /public path or a remote
   *  host (add the host to next.config `images.remotePatterns`). */
  logo: { src: "", alt: "" },
  /** Optional header call-to-action button. `label` empty → hidden. */
  headerCta: { label: "Get in touch", href: "/#contact" },
  /** Primary nav. Items may have `children` → the mobile menu drills into them
   *  (multi-level, with back navigation); desktop shows top-level links. */
  nav: [
    { label: "Home", href: "/" },
    {
      label: "What we do",
      href: "/#services",
      children: [
        { label: "SEO", href: "/services/seo" },
        { label: "PPC", href: "/services/ppc" },
        { label: "Web design", href: "/services/web" },
      ],
    },
    { label: "Contact", href: "/#contact" },
  ],
  footer: {
    company: "Pod Digital",
    strapline: "AI-built, human-reviewed websites.",
    /** Business address / NAP — helps local SEO + E-E-A-T. Empty → hidden. */
    address: "",
    /** Footer link columns. */
    columns: [
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Contact", href: "/#contact" },
        ],
      },
      {
        title: "Services",
        links: [
          { label: "SEO", href: "/services/seo" },
          { label: "PPC", href: "/services/ppc" },
          { label: "Web design", href: "/services/web" },
        ],
      },
    ],
    /** Social links (text labels — no brand icons). */
    social: [{ label: "LinkedIn", href: "https://www.linkedin.com" }],
    /** Legal links shown in the footer bottom bar. */
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
