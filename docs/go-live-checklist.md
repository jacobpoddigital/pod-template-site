# Go-live checklist

Run this before any site on this template launches. It consolidates the SEO / security / performance /
reliability gates that the boilerplate-confirmation checklist (`web-ai-automation/input/headless-wordpress-boilerplate-checklist.md`)
flagged as launch-phase. Tick every box; anything that can't be ticked is a launch blocker until waived in writing.

> Origin: the Website Navigator build (2026-06-12) was the template's first fresh-start. It exposed that
> these launch-phase concerns had no single home. This is that home.

## SEO & indexability
- [ ] `metadataBase` is the **frontend** domain; canonical is correct on every page type (never the WP origin).
- [ ] `robots.ts` + `sitemap.ts` output the right URLs; sitemap covers all published content.
- [ ] Google Search Console verified; sitemap submitted.
- [ ] OG + Twitter card tags tested in a real link-preview tool (not just present in markup).
- [ ] JSON-LD present for relevant types (FAQ ✅ from the block; add LocalBusiness / Breadcrumb / Article as needed).
- [ ] 301 redirects mapped for every changed URL from the old site (`next.config.ts → redirects()`). Migration SEO depends on this.
- [ ] Pagination handled correctly on any archive/listing pages.

## Security (the items that are OFF in dev by design)
- [ ] **GraphQL introspection DISABLED in production.** It is enabled in dev to debug the schema — it must be off live. (WPGraphQL settings / `graphql_introspection_enabled` filter.)
- [ ] GraphQL query depth/complexity limiting configured (prevent endpoint abuse).
- [ ] Security headers verified live (`next.config.ts → headers()` ships X-Frame-Options, nosniff, HSTS, Referrer-Policy, Permissions-Policy).
- [ ] **Per-site CSP added** (`Content-Security-Policy`) allowing only this site's WP media host, GTM/GA4, the CMP, and any embeds. No `default-src *`.
- [ ] `/wp-admin` behind IP allowlist; WP login protected; only ACF Pro + WPGraphQL + wpgraphql-acf installed; unused plugins/themes removed.
- [ ] `/api/revalidate` requires `REVALIDATE_SECRET` (already enforced); secrets are server-only (no `NEXT_PUBLIC_` leakage).
- [ ] Staging/preview frontend blocked from indexing (preview robots / password); WP `blog_public = 0`.

## Performance
- [ ] Lighthouse / CrUX baseline captured; LCP ≤ 1.5s mobile · INP ≤ 200ms · CLS ≤ 0.05 (KB targets) — or a documented waiver.
- [ ] Exactly one `priority` image per page (the LCP candidate); `sizes` on every `<Image>`.
- [ ] Third-party scripts (GTM/GA4/chat) loaded via `next/script` with the right `strategy` — gated on consent (see `docs/measurement-and-consent.md`).
- [ ] ISR tags in place; `/api/revalidate` wired to a WP save hook.

## Analytics, consent & monitoring
- [ ] GA4 + GTM + Consent Mode v2 + CMP wired and tested (see `docs/measurement-and-consent.md`). Measurement-first is the standard build (ADR 0003), not an add-on.
- [ ] Conversion tracking configured for the site's primary action (form → CRM, call, etc.).
- [ ] Error monitoring live (frontend + GraphQL errors captured); team alerted on production breakage.
- [ ] Uptime/deploy-failure alerting active (Vercel→Slack deploy notifications + an uptime monitor).

## Reliability & content
- [ ] Deleted-page behaviour confirmed (ISR last-good + `notFound()`; redirect-on-delete if the URL had value).
- [ ] Broken-link check run pre- and post-launch.
- [ ] Draft preview decision made (wire `draftMode()` if the client needs to preview unpublished content).
- [ ] A non-builder did a fresh `provision.sh` + `pnpm dev` and reached a rendered page without help (the real maturity test).
