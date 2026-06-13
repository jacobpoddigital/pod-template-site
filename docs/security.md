# Security — the consolidated standard

One home for the agency's security approach so every site follows the same standards
(boilerplate §21). Pairs with the launch gate in `docs/go-live-checklist.md` (§Security)
and the lockdown runbook in `web-ai-automation/workflow/01`.

## Enforced automatically (ships in the template)

- **Security headers** — `next.config.ts → headers()` sends `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy` on every response.
- **GraphQL endpoint hardening** — `wp/mu-plugins/pod-graphql-hardening.php` filters the WPGraphQL settings so that, **in production only** (`wp_get_environment_type() === 'production'`):
  - public schema **introspection is disabled** (`public_introspection_enabled` → `off`), and
  - a **max query depth** is enforced (`query_depth_enabled` → `on`, `query_depth_max` ≤ 15).
  - Dev/staging are untouched (introspection stays available for `get-graphql-schema` regen) **because the dev compose sets `WP_ENVIRONMENT_TYPE=local`** — `wp_get_environment_type()` DEFAULTS to `production` when unset, so this opt-out is required.
- **Webhook auth** — `/api/revalidate` requires `REVALIDATE_SECRET` (401 without it).
- **Secrets are server-only** — the WPGraphQL URL + all keys are read server-side; nothing is `NEXT_PUBLIC_`.

## Per-site at launch (go-live checklist gates these)

- **Content-Security-Policy** — add a per-site `Content-Security-Policy` allowing only this site's WP media host, GTM/GA4, the CMP, and any embeds. No `default-src *`. (Per-site because the allowed hosts differ.)
- **WordPress lockdown** (`workflow/01`): `/wp-admin` behind an IP allowlist; login protected (2FA where the host supports it); only ACF Pro + WPGraphQL + wpgraphql-acf installed; unused plugins/themes removed; `blog_public = 0`.
- **Staging frontend `noindex`** — `robots.ts` blocks non-production deploys (Vercel preview / `NEXT_PUBLIC_NOINDEX=1`).
- **Broken-link check** — run pre- and post-launch, e.g. `npx linkinator https://<url> --recurse --skip "mailto:|tel:"` (or `lychee`). Fix or redirect 404s before launch.

## Process

- **Key rotation** — secrets are Doppler-managed; rotate in Doppler (it syncs to the host) and redeploy. Rotate immediately on any suspected exposure; the WordPress DB password is host-internal and rotatable in the host dashboard.
- **Error visibility** — application errors flow through the observability seam (`docs/observability.md`); wire a monitor + Slack alerting before launch (§17).
- **Mandatory pre-launch gate** — `docs/go-live-checklist.md` **and** the `/security-review` skill are a required Phase-7 step. Anything that can't be ticked is a launch blocker until waived in writing.
