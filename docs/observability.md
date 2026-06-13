# Observability — error reporting

Boilerplate checklist §17. Every site needs production error visibility. **Sentry is wired
(`@sentry/nextjs`) but INERT** — it does nothing until a DSN is set, so turning it on is just
creating a free Sentry project and setting two env vars.

## The seam

`src/lib/observability/report-error.ts` exports `reportError(error, context?)`. It is
called from every error path:

- `src/app/error.tsx` — route-level error boundary (`{ boundary: "route" }`)
- `src/app/global-error.tsx` — root error boundary (`{ boundary: "global" }`)
- `src/lib/cms/client.ts` — the CMS/GraphQL fetch catch (`{ scope: "cms", tags }`), which
  reports then **rethrows** so the page/build still fails loud.

`reportError` now forwards to `Sentry.captureException` **when a DSN is set**, and still
`console.error`s in dev. No DSN ⇒ Sentry never inits and this is a no-op.

## What's wired (Sentry, free Developer plan)

- `@sentry/nextjs` installed; runtime init via:
  - `instrumentation.ts` — server/edge `Sentry.init` + `onRequestError` (server-component / route-handler errors), **only if `SENTRY_DSN` is set**.
  - `instrumentation-client.ts` — browser `Sentry.init` + `onRouterTransitionStart`, **only if `NEXT_PUBLIC_SENTRY_DSN` is set**.
  - `src/lib/observability/report-error.ts` — forwards explicit reports from the seam.
- All three are **inert without a DSN** — local/dev/prod-without-DSN emit nothing.

## Turning it on (NEEDS-SETUP — accounts)

1. Create a **free** Sentry project (Developer plan, ~5k errors/mo) → copy the **DSN**.
2. Set `SENTRY_DSN` (server) **and** `NEXT_PUBLIC_SENTRY_DSN` (client) — same DSN — in the env (Vercel). Deploy. Done — capture is live.
3. **Optional later — source maps** for readable stack traces: approve the `@sentry/cli` build script, wrap `next.config.ts` with `withSentryConfig` (org/project + `SENTRY_AUTH_TOKEN`). Runtime capture works without this; it just makes traces prettier.

PostHog (product analytics + error tracking) can complement from the same seam (ADR 0003). See
`web-ai-automation/research/2026-06-05-error-handling-and-observability.md`.

## Alerting

Application-error → Slack alerting (frontend/GraphQL exceptions) is a follow-up: route the
monitor's alerts to the agency Slack (the Hub already sends deploy/event notifications).
