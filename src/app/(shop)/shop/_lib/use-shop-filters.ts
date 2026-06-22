"use client";

import { useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Shared URL-sync logic for the shop filter UI (controls + chips). Filter state lives entirely
// in searchParams (shareable, back-button friendly — Baymard/NN-g best practice).
export const FACET_GROUPS = [
  { key: "gender", label: "Gender" },
  { key: "type", label: "Type" },
  { key: "brand", label: "Brand" },
  { key: "drop", label: "Heel drop" },
  { key: "cushioning", label: "Cushioning" },
  { key: "pronation", label: "Support" },
  { key: "weight", label: "Weight" },
  { key: "width", label: "Width" },
  { key: "colour", label: "Colour" },
] as const;

export type FacetGroupKey = (typeof FACET_GROUPS)[number]["key"];
export const ALL_PARAM_KEYS = ["q", "sort", "min", "max", "instock", ...FACET_GROUPS.map((g) => g.key)];

// Shared interface implemented by BOTH the URL-backed controller (desktop, live) and the
// staged controller (mobile drawer, draft → apply). ShopFilters renders against this.
export type FilterController = {
  get: (key: string) => string | null;
  csv: (key: string) => string[];
  setParam: (key: string, value: string | null) => void;
  toggle: (key: string, slug: string) => void;
  clearAll: () => void;
  hasFilters: boolean;
  isPending: boolean;
};

export function useShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  // Navigations are wrapped in a transition: React keeps the current controls + results
  // mounted (no loading-flash, no disappearing sidebar) and swaps when the new server render
  // is ready. isPending lets the UI signal "updating" without unmounting anything.
  const [isPending, startTransition] = useTransition();
  const nav = useCallback(
    (url: string) => startTransition(() => router.replace(url, { scroll: false })),
    [router],
  );

  const get = useCallback((k: string) => sp.get(k), [sp]);
  const csv = useCallback((k: string) => sp.get(k)?.split(",").filter(Boolean) ?? [], [sp]);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp.toString());
      // Any change other than paging itself resets pagination to page 1 (else you land on an
      // empty page-N of a smaller set). `page` is display-only — not a filter.
      if (key !== "page") params.delete("page");
      if (value) params.set(key, value);
      else params.delete(key);
      nav(params.toString() ? `${pathname}?${params}` : pathname);
    },
    [sp, pathname, nav],
  );

  const toggle = useCallback(
    (key: string, slug: string) => {
      const cur = sp.get(key)?.split(",").filter(Boolean) ?? [];
      const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
      setParam(key, next.join(",") || null);
    },
    [sp, setParam],
  );

  // Remove several params in ONE navigation (sequential setParam calls would race the stale sp).
  const removeKeys = useCallback(
    (keys: string[]) => {
      const params = new URLSearchParams(sp.toString());
      [...keys, "page"].forEach((k) => params.delete(k)); // removing a filter also resets paging
      nav(params.toString() ? `${pathname}?${params}` : pathname);
    },
    [sp, pathname, nav],
  );

  const clearAll = useCallback(() => nav(pathname), [nav, pathname]);
  const hasFilters = ALL_PARAM_KEYS.some((k) => sp.get(k));

  return { sp, get, csv, setParam, toggle, removeKeys, clearAll, hasFilters, isPending };
}
