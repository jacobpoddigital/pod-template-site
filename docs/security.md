# Security — the consolidated standard

One home for the agency's security approach so every site follows the same standards
(boilerplate §21). Pairs with the launch gate in `docs/go-live-checklist.md` (§Security)
and the lockdown runbook in `web-ai-automation/workflow/01`.

## Enforced automatically (ships in the template)

- **Security headers** — `next.config.ts → headers()` sends `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy` on every response.
  - **`Permissions-Policy: camera=(), microphone=(self), geolocation=()`** — camera and geolocation are denied outright; the **microphone is opened for the site's own origin** because the Website Avatar voice widget calls `getUserMedia()` and is a standard build feature. A denied mic (`microphone=()`) blocks capture *before* the browser permission prompt — the tell-tale symptom is a `Permissions policy violation: microphone is not allowed in this document` console error with **no mic dialog ever appearing**. If a site runs the voice widget from a **cross-origin iframe**, `(self)` is insufficient — allowlist the iframe origin: `microphone=(self "https://<iframe-origin>")` (and the third party must set `allow="microphone"` on their iframe). Sites that ship no mic feature can safely tighten this back to `microphone=()`.
- **Content-Security-Policy (report-only default)** — `csp.config.ts` ships a default CSP covering the standard stack (GTM/GA4/Ads + the Cookiebot CMP). It's emitted as **`Content-Security-Policy-Report-Only`** so it logs violations without ever blocking — it cannot break a site. **Per project:** set `NEXT_PUBLIC_WP_MEDIA_HOST` (the WP/Atlas media origin) and any `CSP_EXTRA_HOSTS` (embeds), watch the browser report console until clean, then **flip to enforcing** with `CSP_MODE=enforce`. Optional `CSP_REPORT_URI` to collect violations. (Note: GTM's inline bootstrap requires `'unsafe-inline'` in `script-src` without nonce infra — acceptable under report-only; add a nonce per site if strict enforcement is needed.)
- **GraphQL endpoint hardening** — `wp/mu-plugins/pod-graphql-hardening.php` filters the WPGraphQL settings so that, **in production only** (`wp_get_environment_type() === 'production'`):
  - public schema **introspection is disabled** (`public_introspection_enabled` → `off`), and
  - a **max query depth** is enforced (`query_depth_enabled` → `on`, `query_depth_max` ≤ 15).
  - Dev/staging are untouched (introspection stays available for `get-graphql-schema` regen) **because the dev compose sets `WP_ENVIRONMENT_TYPE=local`** — `wp_get_environment_type()` DEFAULTS to `production` when unset, so this opt-out is required.
- **Webhook auth** — `/api/revalidate` requires `REVALIDATE_SECRET` (401 without it).
- **Secrets are server-only** — the WPGraphQL URL + all keys are read server-side; nothing is `NEXT_PUBLIC_`.

## Per-site at launch (go-live checklist gates these)

- **Flip CSP to enforcing** — the default CSP ships report-only (see above). Before launch: set the media host + any embed origins, confirm the report console is clean, then set `CSP_MODE=enforce`. No `default-src *`, ever.
- **WordPress lockdown** (`workflow/01`): `/wp-admin` behind an IP allowlist; login protected (2FA where the host supports it); only ACF Pro + WPGraphQL + wpgraphql-acf installed; unused plugins/themes removed; `blog_public = 0`.
- **Staging frontend `noindex`** — `robots.ts` blocks non-production deploys (Vercel preview / `NEXT_PUBLIC_NOINDEX=1`).
- **Broken-link check** — `pnpm links` (linkinator, pre-configured) crawls the built site and fails on broken internal links; run pre-launch once content is complete. See `docs/links.md`.

## Process

- **Key rotation** — secrets are Doppler-managed; rotate in Doppler (it syncs to the host) and redeploy. Rotate immediately on any suspected exposure; the WordPress DB password is host-internal and rotatable in the host dashboard.
- **Error visibility** — application errors flow through the observability seam (`docs/observability.md`); wire a monitor + Slack alerting before launch (§17).
- **Mandatory pre-launch gate** — `docs/go-live-checklist.md` **and** the `/security-review` skill are a required Phase-7 step. Anything that can't be ticked is a launch blocker until waived in writing.
