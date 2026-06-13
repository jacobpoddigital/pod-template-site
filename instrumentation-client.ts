// Client-side Sentry init (boilerplate §17), Next App Router instrumentation-client hook.
// INERT until NEXT_PUBLIC_SENTRY_DSN is set. Captures unhandled browser errors + (optional) tracing.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    enabled: process.env.NODE_ENV === "production",
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0),
  });
}

// Instruments App Router client navigations for tracing (no-op until init'd).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
