"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { computeFacets, countResults } from "@/lib/commerce/facet-logic";
import type { FacetMembership, ShopFacets, ShopFilters, SortKey } from "@/lib/commerce/facet-logic";
import type { FilterController } from "./use-shop-filters";

// Mobile drawer controller: selections are STAGED in local state (not written to the URL on each
// tap). The preview facets + result count are computed CLIENT-SIDE from the facet universe (same
// pure maths as the server) so they update INSTANTLY. `apply()` commits the whole draft to the URL
// at once; `reset()` discards it (cancel). Conforms to FilterController so ShopFilters is reused.
type Params = Record<string, string>;

function paramsToFilters(p: Params): ShopFilters {
  const csv = (k: string) => p[k]?.split(",").filter(Boolean);
  const num = (k: string) => {
    const n = Number(p[k]);
    return p[k] && Number.isFinite(n) ? n : undefined;
  };
  return {
    search: p.q || undefined,
    gender: csv("gender"),
    type: csv("type"),
    brand: csv("brand"),
    drop: csv("drop"),
    cushioning: csv("cushioning"),
    pronation: csv("pronation"),
    weight: csv("weight"),
    width: csv("width"),
    colour: csv("colour"),
    minPrice: num("min"),
    maxPrice: num("max"),
    inStock: p.instock === "1" || undefined,
    sort: (p.sort as SortKey) || undefined,
  };
}

export type StagedController = FilterController & {
  previewFacets: ShopFacets;
  previewCount: number;
  dirty: boolean;
  apply: () => void;
  reset: () => void;
};

// `basePath` is the path mobile Apply commits to (default /shop). On a locked landing page
// (/shop/[gender], /shop/[gender]/[type]) the lock isn't a URL param, so committing the draft
// to the landing path preserves the lock instead of dropping back to the unfiltered /shop.
export function useStagedFilters(
  universe: FacetMembership[],
  labels: ShopFacets,
  basePath = "/shop",
): StagedController {
  const router = useRouter();
  const sp = useSearchParams();
  const applied = useMemo(() => Object.fromEntries(sp.entries()) as Params, [sp]);
  const [draft, setDraft] = useState<Params>(applied);

  const get = useCallback((k: string) => draft[k] ?? null, [draft]);
  const csv = useCallback((k: string) => draft[k]?.split(",").filter(Boolean) ?? [], [draft]);
  const setParam = useCallback((k: string, v: string | null) => {
    setDraft((d) => {
      const n = { ...d };
      if (v) n[k] = v;
      else delete n[k];
      return n;
    });
  }, []);
  const toggle = useCallback(
    (k: string, slug: string) => {
      const cur = draft[k]?.split(",").filter(Boolean) ?? [];
      const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
      setParam(k, next.join(",") || null);
    },
    [draft, setParam],
  );
  const clearAll = useCallback(() => setDraft({}), []);

  const filters = paramsToFilters(draft);
  const previewFacets = useMemo(() => computeFacets(universe, filters, labels), [universe, labels, filters]);
  const previewCount = useMemo(() => countResults(universe, filters), [universe, filters]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);

  const apply = useCallback(() => {
    const qs = new URLSearchParams(draft).toString();
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  }, [draft, router, basePath]);
  const reset = useCallback(() => setDraft(applied), [applied]);

  return {
    get,
    csv,
    setParam,
    toggle,
    clearAll,
    hasFilters: Object.keys(draft).length > 0,
    isPending: false,
    previewFacets,
    previewCount,
    dirty,
    apply,
    reset,
  };
}
