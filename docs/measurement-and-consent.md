# Measurement & consent — the standard build

**Status: the agency standard (ADR 0003, amended). CORE NOW WIRED (Batch 3) — INERT until a GTM ID
lands; the CMP vendor is the remaining decision.** GTM + Consent Mode v2 (default-denied) ship in
`src/app/analytics.tsx`; the consent-update API is `src/lib/analytics/consent.ts`. GA4 / Ads / Meta
are configured **inside the GTM container** (UI), not in code. Verify it on the go-live checklist.

## What's coded now (CMP-agnostic, inert)
- `src/app/analytics.tsx` — renders, **only when `NEXT_PUBLIC_GTM_ID` is set AND `NODE_ENV=production`**:
  (1) a Consent Mode v2 `default` (all ad/analytics storage **denied**, `wait_for_update:500`, exposes
  `window.gtag`) as a `beforeInteractive` script; (2) the GTM loader (`afterInteractive`); (3) the GTM
  `<noscript>` iframe. Local/dev/mock emit **nothing**.
- `src/lib/analytics/consent.ts` — `updateConsent({analytics,ads})` / `grantAll()` / `denyAll()` push
  Consent Mode v2 updates. **This is the CMP adapter point.**

## Remaining (needs your input)
1. **Pick the CMP** (the one open decision). Whatever it is, wire its accept/reject handler to call
   `grantAll()` / `denyAll()` (or `updateConsent`). For a script-tag CMP (Cookiebot/iubenda), add its
   loader as a `beforeInteractive` `<Script>` next to the consent-default and subscribe to its event.
2. **Provide `NEXT_PUBLIC_GTM_ID`** (+ build GA4/Ads/Meta tags inside the GTM container).
3. **Conversion tracking** for the primary action — configured in GTM, triggered on the form success.

> Why it's the standard, not an option: PodDigital is a digital marketing agency. Measurement **is** the
> product. GA4 + GTM + Consent Mode v2 + a CMP + conversion tracking are the default build. The opt-out
> (cookieless PostHog only) is for brochure / no-paid-media clients — see the service-profile model (ADR 0016).

## What "standard" includes
1. **GTM** — the single tag container. All other tags (GA4, Ads, Meta) load through it.
2. **GA4** — base measurement.
3. **Consent Mode v2** — `gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', … })` set **before** GTM loads; updated to `granted` only when the CMP signals consent.
4. **A CMP** (consent management platform) — renders the banner, stores the choice, drives the consent update.
5. **Conversion tracking** — Google Ads + Meta conversions for the site's primary action (for Website Navigator: the demo form → CRM).
6. **PostHog** — complementary product analytics + error tracking (not a replacement for the above).

## How to wire it (the pattern, not yet coded in the template)
- **Consent default first.** Inline `gtag('consent','default',…all denied…)` in `app/layout.tsx` `<head>` (or a tiny `beforeInteractive` script) so it runs before any measurement tag.
- **GTM via `next/script`** with `strategy="afterInteractive"`. Never a synchronous `<script>` in `<head>`.
- **CMP loads early**, gates everything: on "accept", call `gtag('consent','update',{…granted…})`; on "reject", leave denied. Analytics tags must respect the denied state (Consent Mode handles this for Google tags; non-Google tags must be blocked until consent).
- **Env-driven IDs** — `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_ID` etc. in `.env.example`. These are public by design (they ship to the browser); keep real secrets server-only.
- **No measurement in mock/dev** unless explicitly testing it — gate on `process.env.NODE_ENV === "production"` or a flag so local builds stay clean.

## Opt-out profile (brochure / no paid media)
Cookieless PostHog only, no GTM/GA4/Ads/Meta, no consent banner needed for strictly-necessary cookieless analytics. Decided per client at brief time from the service mix (ADR 0016).

## Checklist hooks
The go-live checklist (`docs/go-live-checklist.md → Analytics, consent & monitoring`) gates this. Don't launch a paid-media client without it.
