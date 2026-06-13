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

## CMP — Cookiebot (the agency standard, chosen 2026-06-13)
Wired CMP-agnostically on top of the consent API:
- `src/app/analytics.tsx` loads the Cookiebot script (`consent.cookiebot.com/uc.js`,
  `data-blockingmode="auto"`) as `beforeInteractive` when `NEXT_PUBLIC_COOKIEBOT_ID` is set + production.
- `src/app/cookiebot-bridge.tsx` (`'use client'`) listens for `CookiebotOnAccept`/`CookiebotOnDecline`
  and maps Cookiebot categories → Consent Mode v2 (`statistics`→analytics, `marketing`→ads) via
  `updateConsent()`. Mounted by layout only when the CMP is enabled.
- Swapping CMP later = replace the loader + bridge; the consent API and GTM stay put.

## Remaining (needs your input)
1. **Cookiebot account** → set `NEXT_PUBLIC_COOKIEBOT_ID` (the domain-group "cbid"). Register the
   client's domain in Cookiebot.
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

## How it's wired (shipped in the template — inert until IDs land)
> Implemented in `src/app/analytics.tsx` (GTM + Consent Mode v2), `src/app/cookiebot-bridge.tsx` (Cookiebot CMP → consent), and `src/lib/analytics/consent.ts`. Inert until `NEXT_PUBLIC_GTM_ID` + `NEXT_PUBLIC_COOKIEBOT_ID` are set. The pattern below is what that code does:

- **Consent default first.** Inline `gtag('consent','default',…all denied…)` in `app/layout.tsx` `<head>` (or a tiny `beforeInteractive` script) so it runs before any measurement tag.
- **GTM via `next/script`** with `strategy="afterInteractive"`. Never a synchronous `<script>` in `<head>`.
- **CMP loads early**, gates everything: on "accept", call `gtag('consent','update',{…granted…})`; on "reject", leave denied. Analytics tags must respect the denied state (Consent Mode handles this for Google tags; non-Google tags must be blocked until consent).
- **Env-driven IDs** — `NEXT_PUBLIC_GTM_ID` + `NEXT_PUBLIC_COOKIEBOT_ID` in `.env.example`. GA4 / Google Ads / Meta tags live INSIDE the single GTM container (not separate env vars). These IDs are public by design (they ship to the browser); keep real secrets server-only.
- **No measurement in mock/dev** unless explicitly testing it — gate on `process.env.NODE_ENV === "production"` or a flag so local builds stay clean.

## Opt-out profile (brochure / no paid media)
Cookieless PostHog only, no GTM/GA4/Ads/Meta, no consent banner needed for strictly-necessary cookieless analytics. Decided per client at brief time from the service mix (ADR 0016).

## Checklist hooks
The go-live checklist (`docs/go-live-checklist.md → Analytics, consent & monitoring`) gates this. Don't launch a paid-media client without it.

## Global Privacy Control (GPC)

`src/lib/analytics/consent.ts` honours **GPC** — the browser/extension "do not sell or
share" opt-out (CCPA/CPRA, actively enforced; see `research/2026-06-13-build-gap-analysis`
§1.1). `gpcEnabled()` reads `navigator.globalPrivacyControl`; `updateConsent()` forces
`ad_storage`/`ad_user_data`/`ad_personalization` to **denied** whenever GPC is on,
regardless of any CMP choice. `analytics_storage` stays per-choice (GPC targets sale/
sharing — i.e. advertising — not first-party measurement). Default consent is already
denied, so GPC's job here is to prevent a later *grant* of ad/targeting consent.
