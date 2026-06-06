"use client";

// Route-level error boundary (workflow/01 §Phase 4). Sentry wiring is deferred
// from the MVP (STATUS.md) — when added, report `error` here.

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-ink-muted">
        Please try again — if it keeps happening, we&apos;re probably already on it.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-button bg-brand px-6 py-3 font-semibold text-on-brand"
      >
        Try again
      </button>
    </div>
  );
}
