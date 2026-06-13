"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/observability/report-error";

// Route-level error boundary (workflow/01 §Phase 4). Reports to the observability
// seam (no-op until a monitor is wired — see docs/observability.md).

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, { boundary: "route", digest: error.digest });
  }, [error]);
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="display-md">Something went wrong</h1>
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
