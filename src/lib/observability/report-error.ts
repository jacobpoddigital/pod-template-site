// Error-reporting seam (boilerplate §17). A single chokepoint every error path calls —
// route + global error boundaries and the CMS fetch catch — so wiring an error monitor
// (Sentry / PostHog) is a ONE-file change here, not a hunt across the app.
//
// Inert until a monitor is configured: in dev it logs; in prod it currently swallows
// (no DSN yet). To turn on: install @sentry/nextjs, set SENTRY_DSN /
// NEXT_PUBLIC_SENTRY_DSN, and forward to Sentry.captureException below. See
// docs/observability.md.

export type ErrorContext = Record<string, unknown>;

export function reportError(error: unknown, context?: ErrorContext): void {
  if (process.env.NODE_ENV !== "production") {
    console.error("[reportError]", error, context ?? "");
    return;
  }
  // TODO(observability): when an error monitor is configured, forward here, e.g.
  //   Sentry.captureException(error, { extra: context });
  // Until then this is intentionally a no-op in production (boilerplate §17 seam).
}
