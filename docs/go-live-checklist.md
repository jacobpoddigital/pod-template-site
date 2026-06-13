# Go-live checklist

Run this before any site on this template launches. It consolidates the SEO / security / performance /
reliability gates that the boilerplate-confirmation checklist (`web-ai-automation/input/headless-wordpress-boilerplate-checklist.md`)
flagged as launch-phase. Tick every box; anything that can't be ticked is a launch blocker until waived in writing.

> Origin: the Website Navigator build (2026-06-12) was the template's first fresh-start. It exposed that
> these launch-phase concerns had no single home. This is that home.

## SEO & indexability  (detail: `docs/seo.md`)
- [ ] `metadataBase` is the **frontend** domain; canonical is correct on every page type (never the WP origin). WP "Site Address (home)" points at the frontend so Yoast emits frontend canonical/OG/schema (`FRONTEND_URL=… provision.sh`).
- [ ] Yoast SEO (free) + "Add WPGraphQL SEO" active; per-page title/description/OG editable and rendering via `pageMetadata`. Yoast's own XML sitemap disabled (`pod-yoast-headless.php`).
- [ ] `robots.ts` + `sitemap.ts` output the right URLs; sitemap covers all published **pages and posts**. If the site has a blog, a post route (`app/blog/[slug]`) exists so post URLs resolve.
- [ ] Google Search Console **and Bing Webmaster Tools** verified; sitemap submitted to both (Bing powers ChatGPT/Copilot search). Consider IndexNow.
- [ ] `/llms.txt` reachable and lists the right pages; AI-crawler policy in `robots.ts` reviewed per client (allow retrieval vs training).
- [ ] OG + Twitter card tags tested in a real link-preview tool (not just present in markup).
- [ ] JSON-LD present for relevant types: site-wide (Organization/WebSite), Yoast per-page graph, FAQ ✅ from the block; add LocalBusiness / Breadcrumb / Article as needed.
- [ ] **Single Organization `@id`** — in Yoast → *Site representation* set the site as an **Organization** (NOT Person) with the **same name + logo** as `site.config.ts`. Our site-wide node uses `@id ${SITE}/#organization` = Yoast's convention (home→frontend), so the two merge into ONE entity. If Yoast is set to Person, you get a mismatched second node. Fill the `site.config.organization` block (legalName/foundingDate/vatId/founders…). **Verify:** Rich Results Test shows a single Organization at `…/#organization` with your `sameAs`/logo. (workflow/34, docs/seo.md §Organization schema.)
- [ ] 301 redirects mapped for every changed URL from the old site — `redirects.json` (committed inventory) and/or a WP redirects plugin via `WP_REDIRECTS_URL` (`docs/seo.md §Redirects`). Migration SEO depends on this.
- [ ] Pagination handled correctly on any archive/listing pages.

## Security (the items that are OFF in dev by design)
- [ ] **GraphQL introspection DISABLED in production** — auto-enforced by `wp/mu-plugins/pod-graphql-hardening.php` (filters `public_introspection_enabled` → off when `wp_get_environment_type()` is `production`). Dev keeps it via `WP_ENVIRONMENT_TYPE=local`. **Verify live:** a public `{ __schema { queryType { name } } }` query is rejected.
- [ ] **GraphQL query depth limiting** — auto-enforced by the same mu-plugin (max depth 15). **Verify live:** a deliberately over-deep query errors; the real page query still 200s.
- [ ] Security headers verified live (`next.config.ts → headers()` ships X-Frame-Options, nosniff, HSTS, Referrer-Policy, Permissions-Policy).
- [ ] **Per-site CSP added** (`Content-Security-Policy`) allowing only this site's WP media host, GTM/GA4, the CMP, and any embeds. No `default-src *`.
- [ ] `/wp-admin` behind IP allowlist; WP login protected; only ACF Pro + WPGraphQL + wpgraphql-acf installed; unused plugins/themes removed.
- [ ] `/api/revalidate` requires `REVALIDATE_SECRET` (already enforced); secrets are server-only (no `NEXT_PUBLIC_` leakage).
- [ ] Staging/preview frontend blocked from indexing (preview robots / password); WP `blog_public = 0`.

## Performance
- [ ] Lighthouse / CrUX baseline captured; LCP ≤ 1.5s mobile · INP ≤ 200ms · CLS ≤ 0.05 (KB targets, **field** metrics via CrUX/real devices) — or a documented waiver. The CI Lighthouse budget (`docs/performance.md`) is the lab gate for layout-shift / blocking-time / JS weight; this line is the field check.
- [ ] Exactly one `priority` image per page (the LCP candidate); `sizes` on every `<Image>`.
- [ ] Third-party scripts (GTM/GA4/chat) loaded via `next/script` with the right `strategy` — gated on consent (see `docs/measurement-and-consent.md`).
- [ ] ISR tags in place; `/api/revalidate` wired to a WP save hook.

## Analytics, consent & monitoring
- [ ] GA4 + GTM + Consent Mode v2 + CMP wired and tested (see `docs/measurement-and-consent.md`). Measurement-first is the standard build (ADR 0003), not an add-on.
- [ ] Conversion tracking configured for the site's primary action (form → CRM, call, etc.).
- [ ] Error monitoring live (frontend + GraphQL errors captured); team alerted on production breakage.
- [ ] Uptime/deploy-failure alerting active (Vercel→Slack deploy notifications + an uptime monitor).

## Reliability & content
- [ ] Deleted-page behaviour confirmed — a removed/unpublished page serves ISR last-good, then the branded 404 (`app/not-found.tsx`) on rebuild; **if the old URL had SEO value, add a 301 instead** (`docs/seo.md §Redirect-on-delete`) and `curl -I` confirms the redirect.
- [ ] Broken-link check run pre- and post-launch — `pnpm links` reports **zero broken internal links** (`docs/links.md`). Run when content is complete (it flags placeholder/unbuilt routes by design).
- [ ] **Structured-data valid** — `pnpm jsonld` passes (every JSON-LD block parses, has @context/@type, one Article per post). Confirm with Google's Rich Results Test on a real page too.
- [ ] **GPC honoured** — `consent.ts` denies ads/targeting when the browser sends Global Privacy Control (CCPA/CPRA; verify with a GPC-enabled browser that `ad_storage` stays denied).
- [ ] **Form spam guard live** — the contact form's honeypot + time-trap drop bots; consider Cloudflare Turnstile for a high-spam client (per-project key).
- [ ] **Accessibility gate (axe) green** — `pnpm a11y` (pa11y-ci, axe/WCAG2AA) reports **zero errors** on the client's real brand + content. The placeholder brand has a known `bg-primary`/`text-primary-foreground` contrast item the brand pass must clear (`docs/accessibility.md`).
- [ ] **Accessibility statement published** at `/accessibility` and linked in the footer (EAA/Equality Act; template in `docs/accessibility.md`).
- [ ] **AI disclosure** — if the site ships a live chatbot/voice agent, `<AiDisclosure>` is visible; if it uses AI-generated imagery, captions label it (EU AI Act Art. 50; `docs/ai-disclosure.md`).
- [ ] Draft preview decision made — scaffold ships (`/api/preview`, `/api/exit-preview`, `getPage({preview})`). To enable: add a dynamic preview route + WP app-password auth per `docs/preview.md`.
- [ ] A non-builder did a fresh `provision.sh` + `pnpm dev` and reached a rendered page without help (the real maturity test).
