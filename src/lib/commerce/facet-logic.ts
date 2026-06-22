// Pure, framework-agnostic facet logic — shared by the SERVER (getShopData) and the CLIENT
// (staged mobile filter preview) so counts compute identically in both. NO server-only imports.

// `gender` (pa_gender attribute) + `type` (product_cat: Daily Trainers/Stability/Racing/Trail)
// are the primary browse axes — usually LOCKED by the /shop/[gender]/[type] route and omitted
// from the sidebar; the rest are refinement facets. (Pivoted 2026-06-20 from terrain-first.)
export const FACET_KEYS = ["gender", "type", "brand", "drop", "cushioning", "pronation", "weight", "width", "colour"] as const;
export type FacetKey = (typeof FACET_KEYS)[number];

// Weight bands aren't naturally sortable (mix of "Under", ranges, "+") — pin their order by slug
// (seeded in wp/seed-facets.php with these explicit slugs).
const WEIGHT_ORDER = ["w-u220", "w-220-270", "w-270-320", "w-320"];

// "featured" = Woo's manual `menu_order` (merchant-curated catalogue order, Woo's "Default sorting").
export type SortKey = "featured" | "newest" | "rating" | "price-asc" | "price-desc" | "name";
export type ShopFilters = {
  search?: string;
  gender?: string[];
  type?: string[];
  brand?: string[];
  drop?: string[];
  cushioning?: string[];
  pronation?: string[];
  weight?: string[];
  width?: string[];
  colour?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: SortKey;
  // product_tag slugs — not a sidebar facet (tags aren't in FACET_KEYS); set by the /shop/tag/{slug}
  // archive route to lock the listing to a tag (the disjunctive facet maths ignore it).
  tag?: string[];
};

export type Facet = { name: string; slug: string; count: number };
export type ShopFacets = Record<FacetKey, Facet[]>;

// Per-product membership for client/server count maths. `price` is the product's starting price
// (variable products are ranges — this is an approximation good for the preview; the applied
// result is server-authoritative). `name` powers the search preview (name-contains; the server
// does a fuller search on apply).
export type FacetMembership = Record<FacetKey, string[]> & {
  inStock: boolean;
  name: string;
  price: number;
};

// A product satisfies search + price + stock + every ACTIVE facet EXCEPT `exclude`
// (exclude = the facet being counted → disjunctive, so selecting one value doesn't zero its
// siblings). OR within a facet, AND across facets.
// Every active facet except `exclude` must match (OR within a facet).
function facetsMatch(item: FacetMembership, f: ShopFilters, exclude: FacetKey | null): boolean {
  for (const k of FACET_KEYS) {
    if (k === exclude) continue;
    const sel = f[k];
    if (sel?.length && !sel.some((s) => item[k].includes(s))) return false;
  }
  return true;
}

export function matchesExcept(item: FacetMembership, f: ShopFilters, exclude: FacetKey | null): boolean {
  if (f.search && !item.name.toLowerCase().includes(f.search.toLowerCase())) return false;
  if (f.inStock && !item.inStock) return false;
  if (typeof f.minPrice === "number" && item.price < f.minPrice) return false;
  if (typeof f.maxPrice === "number" && item.price > f.maxPrice) return false;
  return facetsMatch(item, f, exclude);
}

export function countResults(universe: FacetMembership[], f: ShopFilters): number {
  return universe.filter((it) => matchesExcept(it, f, null)).length;
}

export function computeFacets(universe: FacetMembership[], f: ShopFilters, labels: ShopFacets): ShopFacets {
  const withCounts = (key: FacetKey, opts: Facet[]): Facet[] =>
    opts.map((o) => ({
      ...o,
      count: universe.filter((it) => matchesExcept(it, f, key) && it[key].includes(o.slug)).length,
    }));
  const out = {} as ShopFacets;
  for (const key of FACET_KEYS) {
    // numeric sort for heel-drop (NN/g); fixed-order sort for weight bands; others keep label order
    let opts = labels[key];
    if (key === "drop") opts = [...labels[key]].sort((a, b) => parseFloat(a.name) - parseFloat(b.name));
    else if (key === "weight") opts = [...labels[key]].sort((a, b) => WEIGHT_ORDER.indexOf(a.slug) - WEIGHT_ORDER.indexOf(b.slug));
    out[key] = withCounts(key, opts);
  }
  return out;
}
