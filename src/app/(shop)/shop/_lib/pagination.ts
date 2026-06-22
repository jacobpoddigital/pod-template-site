import type { SearchParams } from "./parse-filters";
import { PAGINATION_MODE } from "@/lib/commerce/config";

// Listing pagination (category-listing UX standard): URL-backed, crawlable, shareable,
// back-button friendly. `page` is a display-only param, NOT a filter, so it lives outside
// parseShopFilters/ALL_PARAM_KEYS; any filter/sort change resets it to 1 (handled in
// use-shop-filters). The build picks the STYLE via PAGINATION_MODE (commerce/config.ts):
//   • "load-more" — cumulative: page N shows the first N×SIZE items (Baymard default).
//   • "numbered"  — windowed: page N shows only that page's slice, in a numbered <nav>.
// Both share this one seam, so a site switches paging with a single config line.
export const PAGE_SIZE = 12;

export function parsePage(sp: SearchParams): number {
  const raw = sp.page;
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export interface Paginated<T> {
  /** The items to render this request — cumulative (load-more) or windowed (numbered). */
  shown: T[];
  /** Requested page, clamped to [1, totalPages] (a stale ?page=99 lands on the last page). */
  page: number;
  /** Full filtered result count (drives "Showing X of Y" + page numbers). */
  total: number;
  totalPages: number;
}

// Single slice authority for every listing route — derives the window from PAGINATION_MODE so
// the page files don't each re-implement (and drift on) the cumulative-vs-windowed maths.
export function paginate<T>(products: readonly T[], rawPage: number): Paginated<T> {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, rawPage), totalPages);
  const shown =
    PAGINATION_MODE === "numbered"
      ? products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      : products.slice(0, page * PAGE_SIZE);
  return { shown: shown as T[], page, total, totalPages };
}
