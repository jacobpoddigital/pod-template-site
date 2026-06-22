import "server-only";
import { commerceRequest } from "./client";
import { getFilteredProducts, COMMERCE_TAGS } from "./products";
import { CartCrossSellsDocument } from "./generated/graphql";
import type { CartCrossSellsQuery } from "./generated/graphql";
import type { ProductCard, ProductDetail } from "./products";

// Cross-sell / related-products ranking (category-listing UX standard §related-products: rank by
// similarity, not recency). Split out of products.ts to keep that module focused + under the
// file-length budget.

const toNum = (s: string | null): number | null => {
  if (!s) return null;
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

// Proximity score for a numeric spec: 2 if within `near`, 1 if within `mid`, else 0 (null = skip).
function band(a: string | null, b: string | null, near: number, mid: number): number {
  const x = toNum(a), y = toNum(b);
  if (x == null || y == null) return 0;
  const d = Math.abs(x - y);
  return d <= near ? 2 : d <= mid ? 1 : 0;
}

// Higher = more similar. Signals mirror what the PDP's contextual reason labels read from, so
// the cross-sell order and the per-item reason label stay coherent.
function relevanceScore(current: ProductCard, c: ProductCard): number {
  const support = c.pronation && c.pronation === current.pronation ? 3 : 0; // same need = closest
  const cushion = c.cushioning && c.cushioning === current.cushioning ? 2 : 0;
  return support + cushion + band(current.drop, c.drop, 2, 4) + band(current.weightGrams, c.weightGrams, 30, 60);
}

/** Cross-sell: same-type shoes ranked by similarity to the current one, current excluded.
 *  In-stock candidates sort ahead of out-of-stock at equal relevance (don't lead with unbuyable). */
export async function getRelatedProducts(current: ProductCard, count = 8): Promise<ProductCard[]> {
  const typeSlug = current.categories[0]?.slug;
  // Pull a wider pool than `count` so the relevance sort has real choice (not just the first N).
  const pool = await getFilteredProducts({ type: typeSlug ? [typeSlug] : undefined }, count * 3 + 4);
  return pool
    .filter((p) => p.slug !== current.slug)
    .map((p, i) => ({ p, i, score: relevanceScore(current, p) }))
    .sort((a, b) => b.score - a.score || Number(b.p.inStock) - Number(a.p.inStock) || a.i - b.i)
    .slice(0, count)
    .map((x) => x.p);
}

// A rail entry tags its source so the PDP can label merchant picks ("Recommended") distinctly from
// the algorithmic reason copy ("Lighter alternative", etc.).
export type RailItem = { card: ProductCard; source: "merchant" | "related" };

/** Up-sells rail: merchant-curated Woo up-sells FIRST (in the merchant's order), then filled with
 *  algorithmic related products up to `count` — deduped against the merchant set + the current
 *  product. When a product has no up-sells this is just the related list (merchant-first is a no-op). */
export async function getUpsellRail(current: ProductDetail, count = 10): Promise<RailItem[]> {
  const slugs = current.upsellSlugs;
  // Fetch the merchant up-sell cards by slug, restore the merchant-defined order (the GraphQL
  // `slugIn` result order isn't guaranteed to match), and cap at `count` so it's a hard ceiling
  // even if a merchant curates more up-sells than the rail shows.
  const merchant = (
    slugs.length
      ? (await getFilteredProducts({}, slugs.length, { slugIn: slugs }))
          .filter((p) => p.slug !== current.slug)
          .sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug))
      : []
  ).slice(0, count);
  const seen = new Set<string>([current.slug, ...merchant.map((p) => p.slug)]);
  const need = count - merchant.length;
  // Fetch a wider related pool (count + merchant) so dedup against the merchant set can't starve the
  // fill — we still slice to exactly `need`.
  const related = need > 0
    ? (await getRelatedProducts(current, count + merchant.length)).filter((p) => !seen.has(p.slug)).slice(0, need)
    : [];
  return [
    ...merchant.map((card): RailItem => ({ card, source: "merchant" })),
    ...related.map((card): RailItem => ({ card, source: "related" })),
  ];
}

/** Cart CROSS-SELLS (Woo "Linked Products → Cross-sells"): the merchant-curated "add this too"
 *  products for whatever is in the cart. Given the cart's product ids, union every cart product's
 *  cross-sell slugs, drop anything already in the cart, then fetch full ProductCards by slug
 *  (reusing getFilteredProducts, the up-sell pattern). Empty when nothing is cross-sold — the rail
 *  then renders nothing. Cart-display only; the cart write path is unchanged (M2). */
type CartCrossSellNode = NonNullable<CartCrossSellsQuery["products"]>["nodes"][number];

// Split the cart products' nodes into the slugs already in the cart + every cross-sell slug.
// Pulled out of getCartCrossSells to keep that function under the complexity ceiling.
function splitCrossSells(nodes: CartCrossSellNode[]): { inCart: Set<string>; crossSlugs: string[] } {
  const inCart = new Set<string>();
  const crossSlugs: string[] = [];
  for (const n of nodes) {
    if ("slug" in n && n.slug) inCart.add(n.slug);
    const cross = "crossSell" in n ? (n.crossSell?.nodes ?? []) : [];
    for (const c of cross) if ("slug" in c && c.slug) crossSlugs.push(c.slug);
  }
  return { inCart, crossSlugs };
}

export async function getCartCrossSells(cartSlugs: string[], count = 8): Promise<ProductCard[]> {
  if (!cartSlugs.length) return [];
  const data = await commerceRequest<CartCrossSellsQuery>(
    CartCrossSellsDocument,
    { slugIn: cartSlugs },
    [COMMERCE_TAGS.products],
  );
  const { inCart, crossSlugs } = splitCrossSells(data.products?.nodes ?? []);
  // Dedupe, preserve first-seen order, drop products already in the cart.
  const wanted = [...new Set(crossSlugs)].filter((s) => !inCart.has(s)).slice(0, count);
  if (!wanted.length) return [];
  const cards = await getFilteredProducts({}, wanted.length, { slugIn: wanted });
  // Restore the cross-sell order (slugIn result order isn't guaranteed) + final exclusion guard.
  return cards
    .filter((p) => !inCart.has(p.slug))
    .sort((a, b) => wanted.indexOf(a.slug) - wanted.indexOf(b.slug));
}
