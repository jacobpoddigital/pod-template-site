"use client";

import { useShopFilters } from "../_lib/use-shop-filters";
import { SortSelect } from "./sort-select";

// Results toolbar above the grid (category-listing UX standard): live result count + a sort
// control in the conventional top-of-grid position. This is ADDITIVE — it does not move or
// restructure the LOCKED filter sidebar; the sort here binds the SAME `sort` URL param as the
// sheet select, so the two are always in sync. Hidden on mobile (sort lives in the staged
// "Filter & sort" sheet there); the count still shows on every breakpoint.

export function ShopToolbar({ total }: { total: number }) {
  const { get, setParam } = useShopFilters();
  return (
    <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
      <p className="body-sm text-muted-foreground" aria-live="polite">
        {total} {total === 1 ? "shoe" : "shoes"}
      </p>
      {/* Sort lives in the staged "Filter & sort" sheet on mobile → toolbar sort is desktop-only. */}
      <div className="hidden items-center gap-2 lg:flex">
        <label htmlFor="shop-toolbar-sort" className="label text-foreground">
          Sort
        </label>
        <SortSelect
          id="shop-toolbar-sort"
          value={get("sort") ?? "newest"}
          onValueChange={(v) => setParam("sort", v === "newest" ? null : v)}
          triggerClassName="h-11 w-auto min-w-[11rem] body-sm"
        />
      </div>
    </div>
  );
}
