# Observability — error reporting

Boilerplate checklist §17. Every site needs production error visibility. The wiring is
**already in place** via a single seam; turning on a monitor is a one-file change.

## The seam

`src/lib/observability/report-error.ts` exports `reportError(error, context?)`. It is
called from every error path:

- `src/app/error.tsx` — route-level error boundary (`{ boundary: "route" }`)
- `src/app/global-error.tsx` — root error boundary (`{ boundary: "global" }`)
- `src/lib/cms/client.ts` — the CMS/GraphQL fetch catch (`{ scope: "cms", tags }`), which
  reports then **rethrows** so the page/build still fails loud.

Until a monitor is configured it is **inert**: it `console.error`s in dev and is a no-op
in production. So the call sites are correct today and need no change when a monitor lands.

## Turning on Sentry (when the DSN exists — NEEDS-SETUP)

1. Create a Sentry project → get the **DSN** + org/project.
2. `pnpm add @sentry/nextjs` and add the Sentry config files (or `npx @sentry/wizard`).
3. Set `SENTRY_DSN` (server) / `NEXT_PUBLIC_SENTRY_DSN` (client) in the environment.
4. In `report-error.ts`, forward to Sentry in the production branch:
   ```ts
   import * as Sentry from "@sentry/nextjs";
   Sentry.captureException(error, { extra: context });
   ```
   That's the only edit — the call sites already feed it.

PostHog (product analytics + error tracking) can complement or substitute; forward from the
same seam. See `web-ai-automation/research/2026-06-05-error-handling-and-observability.md`.

## Alerting

Application-error → Slack alerting (frontend/GraphQL exceptions) is a follow-up: route the
monitor's alerts to the agency Slack (the Hub already sends deploy/event notifications).
