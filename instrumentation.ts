// Server/edge Sentry init (boilerplate §17). Next runs register() once per runtime at startup.
// INERT until SENTRY_DSN is set — no DSN ⇒ no init, zero overhead. Source-map upload (withSentryConfig
// + SENTRY_AUTH_TOKEN) is a later flip-on; runtime error capture works without it. See docs/observability.md.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return; // inert until configured
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      enabled: process.env.NODE_ENV === "production",
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
    });
  }
}

// Captures errors thrown in server components / route handlers (no-op until init'd).
export const onRequestError = Sentry.captureRequestError;
