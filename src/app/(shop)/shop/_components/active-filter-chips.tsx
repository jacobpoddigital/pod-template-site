"use client";

import { X } from "lucide-react";
import type { ShopFacets } from "@/lib/commerce/products";
import { FACET_GROUPS, useShopFilters } from "../_lib/use-shop-filters";

// Removable chips for every active filter, shown above the results (Baymard: 20% of sites
// fail to keep applied filters visible — high-impact). One tap removes a value.
type Chip = { id: string; label: string; remove: () => void };
type Params = { get(key: string): string | null };
type Handlers = {
  setParam: (k: string, v: string | null) => void;
  toggle: (k: string, s: string) => void;
  removeKeys: (k: string[]) => void;
};

function facetChips(csv: (k: string) => string[], facets: ShopFacets, toggle: Handlers["toggle"]): Chip[] {
  const out: Chip[] = [];
  for (const g of FACET_GROUPS) {
    for (const slug of csv(g.key)) {
      const name = facets[g.key].find((o) => o.slug === slug)?.name ?? slug;
      out.push({ id: `${g.key}-${slug}`, label: `${g.label}: ${name}`, remove: () => toggle(g.key, slug) });
    }
  }
  return out;
}

function buildChips(sp: Params, csv: (k: string) => string[], facets: ShopFacets, h: Handlers): Chip[] {
  const q = sp.get("q");
  const min = sp.get("min");
  const max = sp.get("max");
  return [
    ...(q ? [{ id: "q", label: `“${q}”`, remove: () => h.setParam("q", null) }] : []),
    ...facetChips(csv, facets, h.toggle),
    ...(min || max ? [{ id: "price", label: `£${min || "0"}–${max || "∞"}`, remove: () => h.removeKeys(["min", "max"]) }] : []),
    ...(sp.get("instock") === "1" ? [{ id: "instock", label: "In stock", remove: () => h.setParam("instock", null) }] : []),
  ];
}

export function ActiveFilterChips({ facets }: { facets: ShopFacets }) {
  const { sp, csv, setParam, toggle, removeKeys } = useShopFilters();
  const chips = buildChips(sp, csv, facets, { setParam, toggle, removeKeys });
  if (!chips.length) return null;

  return (
    <ul className="mb-4 flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={c.remove}
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-surface-muted px-3 body-sm text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>{c.label}</span>
            <X className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Remove {c.label} filter</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
