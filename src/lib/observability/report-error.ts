// Error-reporting seam (boilerplate §17). A single chokepoint every error path calls —
// route + global error boundaries and the CMS fetch catch — so the error monitor wiring is a
// ONE-file change here, not a hunt across the app.
//
// WIRED to Sentry (@sentry/nextjs), but INERT until a DSN is set (SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN
// in instrumentation*.ts) — no DSN ⇒ Sentry never inits and captureException is a no-op. In dev it
// also logs to the console. To turn on: create a (free) Sentry project, set the DSNs, deploy. See
// docs/observability.md.

import * as Sentry from "@sentry/nextjs";

export type ErrorContext = Record<string, unknown>;

const SENTRY_ON = !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);

export function reportError(error: unknown, context?: ErrorContext): void {
  if (SENTRY_ON) {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  }
  if (process.env.NODE_ENV !== "production") {
    console.error("[reportError]", error, context ?? "");
  }
}
