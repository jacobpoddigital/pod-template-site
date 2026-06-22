"use client";

import { cn } from "@/lib/utils";
import { Switch } from "@/ui/switch";
import type { ShopFacets } from "@/lib/commerce/products";
import { FACET_GROUPS, type FilterController, type FacetGroupKey } from "../_lib/use-shop-filters";
import { FacetGroup } from "./facet-group";
import { SortSelect } from "./sort-select";

const FIELD =
  "min-h-11 w-full rounded-md border border-border bg-surface px-3 body-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// Filter controls — render against a FilterController (URL-backed on desktop, staged in the
// mobile drawer). idPrefix keeps input ids unique across the two instances. `facets` carries the
// counts (server-computed on desktop, client-preview on mobile).
// `omit` hides specific facet groups — used by /shop/[category] to drop the terrain facet that
// the route already locks (the standardised filter set is otherwise unchanged).
// `showSort` — sort is shown in this control set on MOBILE (the staged "Filter & sort" sheet),
// but hidden on the DESKTOP sidebar, where the results toolbar owns sort (category-listing UX
// standard; amends the filter standard's "sort lives in the sidebar" — sort is now toolbar-only
// on desktop, sheet-only on mobile, never duplicated).
export function ShopFilters({ facets, ctl, idPrefix = "shop", omit, showSort = true }: { facets: ShopFacets; ctl: FilterController; idPrefix?: string; omit?: FacetGroupKey[]; showSort?: boolean }) {
  const { get, csv, setParam, toggle, clearAll, hasFilters, isPending } = ctl;
  const groups = FACET_GROUPS.map((g) => ({ ...g, options: facets[g.key] })).filter(
    (g) => g.options.length > 1 && !omit?.includes(g.key),
  );

  // Price inputs are uncontrolled (commit on blur; `key` re-inits on Clear/cancel/reset). Keyword
  // search is owned by the header SearchAutocomplete (the single search surface) — the sidebar
  // keeps facets + sort + price + stock only.
  const minVal = get("min") ?? "";
  const maxVal = get("max") ?? "";

  return (
    <div className={cn("flex flex-col gap-6 motion-safe:transition-opacity", isPending && "opacity-60")} aria-busy={isPending}>
      {showSort /* mobile sheet only; desktop sort lives in the results toolbar */ && (
        <div>
          <label htmlFor={`${idPrefix}-sort`} className="label mb-2 block text-foreground">Sort</label>
          <SortSelect
            id={`${idPrefix}-sort`}
            value={get("sort") ?? "newest"}
            onValueChange={(v) => setParam("sort", v === "newest" ? null : v)}
            triggerClassName="h-11 w-full body-sm"
          />
        </div>
      )}

      <div className="flex min-h-11 items-center justify-between gap-3">
        <label htmlFor={`${idPrefix}-instock`} className="body-sm text-foreground">In stock only</label>
        <Switch id={`${idPrefix}-instock`} checked={get("instock") === "1"} onCheckedChange={(v) => setParam("instock", v ? "1" : null)} />
      </div>

      {/* Facet groups — collapsed by default (scannable); a collapsed group shows a summary of
          its selected values. Scale-ready: show-more · in-facet search · capped scroll. */}
      {groups.map((g) => (
        <FacetGroup
          key={g.key}
          groupKey={g.key}
          label={g.label}
          options={g.options}
          selected={csv(g.key)}
          onToggle={(slug) => toggle(g.key, slug)}
          onClear={() => setParam(g.key, null)}
          idPrefix={idPrefix}
        />
      ))}

      <fieldset>
        <legend className="label mb-2 text-foreground">Price (£)</legend>
        <div className="flex items-center gap-2">
          <input key={`min-${minVal}`} type="number" inputMode="numeric" aria-label="Minimum price" placeholder="Min" defaultValue={minVal} onBlur={(e) => setParam("min", e.target.value || null)} className={FIELD} />
          <span aria-hidden="true" className="text-muted-foreground">–</span>
          <input key={`max-${maxVal}`} type="number" inputMode="numeric" aria-label="Maximum price" placeholder="Max" defaultValue={maxVal} onBlur={(e) => setParam("max", e.target.value || null)} className={FIELD} />
        </div>
      </fieldset>

      {hasFilters && (
        <button type="button" onClick={clearAll} className="inline-flex min-h-11 items-center self-start body-sm font-medium text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Clear all filters
        </button>
      )}
    </div>
  );
}
