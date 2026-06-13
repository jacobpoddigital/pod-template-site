"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/observability/report-error";

// Root error boundary — replaces the whole document, so it carries its own html/body.

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, { boundary: "global", digest: error.digest });
  }, [error]);
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", textAlign: "center", padding: "6rem 1.5rem" }}>
        <h1>Something went wrong</h1>
        <p>Please try again in a moment.</p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  );
}
