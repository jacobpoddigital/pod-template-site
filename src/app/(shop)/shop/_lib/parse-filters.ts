import type { ShopFilters, SortKey } from "@/lib/commerce/products";

// Shared search-param → ShopFilters parser, used by BOTH /shop and /shop/[category].
// Filter state lives in the URL (shareable, back-button friendly). `overrides` are applied
// LAST — category pages use them to LOCK terrain to the route's category (which isn't a URL
// param there, so the user can't change it).

const SORTS: SortKey[] = ["featured", "newest", "rating", "price-asc", "price-desc", "name"];
export type SearchParams = Record<string, string | string[] | undefined>;

const one = (sp: SearchParams, k: string): string | undefined => {
  const v = sp[k];
  return (Array.isArray(v) ? v[0] : v) || undefined;
};
const csv = (sp: SearchParams, k: string): string[] | undefined => one(sp, k)?.split(",").filter(Boolean);
const num = (sp: SearchParams, k: string): number | undefined => {
  const n = Number(one(sp, k));
  return Number.isFinite(n) ? n : undefined;
};

export function parseShopFilters(sp: SearchParams, overrides?: Partial<ShopFilters>): ShopFilters {
  const sort = one(sp, "sort");
  return {
    search: one(sp, "q"),
    gender: csv(sp, "gender"),
    type: csv(sp, "type"),
    brand: csv(sp, "brand"),
    drop: csv(sp, "drop"),
    cushioning: csv(sp, "cushioning"),
    pronation: csv(sp, "pronation"),
    weight: csv(sp, "weight"),
    width: csv(sp, "width"),
    colour: csv(sp, "colour"),
    minPrice: num(sp, "min"),
    maxPrice: num(sp, "max"),
    inStock: one(sp, "instock") === "1" || undefined,
    sort: SORTS.includes(sort as SortKey) ? (sort as SortKey) : undefined,
    ...overrides,
  };
}
