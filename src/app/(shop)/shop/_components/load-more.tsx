"use client";

import { Button } from "@/ui/button";
import { useShopFilters } from "../_lib/use-shop-filters";

// "Load more" pagination (category-listing UX standard). Cumulative + URL-backed: bumps the
// `page` param, the server re-renders the first (page+1)×SIZE items, the transition keeps the
// grid mounted and swaps when ready. Crawlable/shareable; resets to page 1 on any filter change.
export function LoadMore({ shown, total, page }: { shown: number; total: number; page: number }) {
  const { setParam, isPending } = useShopFilters();
  if (shown >= total) return null;
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <p className="body-sm text-muted-foreground" aria-live="polite">
        Showing {shown} of {total}
      </p>
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={() => setParam("page", String(page + 1))}
      >
        Load more
      </Button>
    </div>
  );
}
