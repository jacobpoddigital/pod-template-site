import "server-only";
import { commerceRequest } from "./client";
import { ProductCategoriesDocument } from "./generated/graphql";
import type { ProductCategoriesQuery, ProductsOrderbyInput } from "./generated/graphql";
import { getFilteredProducts, COMMERCE_TAGS, type ProductCard, type ProductImage } from "./products";

// Read helpers for the CMS-driven merchandising BLOCKS (Part D) — the first commerce-aware ACF
// blocks. They run a parameterised WooGraphQL query from the block's saved ACF fields, then the
// block renders the LOCKED ProductCard / category-card primitive. Thin wrappers over the existing
// read layer (catalogue ordering/filters already live in `getFilteredProducts`).

const nonBlank = (a?: string[] | null): string[] => (a ?? []).filter((s) => Boolean(s));

// Reorder items to the editor's chosen slug order (stable; slugs not in the set sink to the end).
function orderBySlugs<T extends { slug: string }>(items: T[], slugs: string[]): T[] {
  const order = new Map(slugs.map((s, i) => [s, i] as const));
  return [...items].sort(
    (a, b) => (order.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
  );
}

// ── category cards ─────────────────────────────────────────────────────────
export type CategoryCard = {
  id: number;
  name: string;
  slug: string;
  count: number; // product count (the show-count toggle decides whether to render it)
  image: ProductImage | null; // native Woo product_cat image (MediaItem) — placeholder when unset
  href: string; // the category listing this card links to
};

export type CategorySource = "picked" | "top-level" | "all";

type CategoryNode = NonNullable<ProductCategoriesQuery["productCategories"]>["nodes"][number];

function toCategoryCard(n: CategoryNode): CategoryCard {
  const name = n.name ?? "";
  const slug = n.slug ?? "";
  return {
    id: n.databaseId,
    name,
    slug,
    count: n.count ?? 0,
    image: n.image?.sourceUrl ? { url: n.image.sourceUrl, alt: n.image.altText ?? name } : null,
    href: `/shop?type=${encodeURIComponent(slug)}`,
  };
}

// `top-level` → root categories only (parent = 0). `picked` filters by the chosen slugs; every
// other source returns all. `null` = no filter (WPGraphQL ignores null where-args).
const categoryVars = (source: CategorySource, picked: string[] | null, first?: number) => ({
  first: first ?? 12,
  slug: picked,
  parent: source === "top-level" ? 0 : null,
});

// `picked` → exactly the chosen slugs, in the editor's order. `top-level` → root categories only.
// `all` → every non-empty category. Ordered by product count (most-stocked first) unless `picked`
// (then the editor's order wins).
export async function getCategoryCards(
  opts: { source?: CategorySource; slugs?: string[]; first?: number } = {},
): Promise<CategoryCard[]> {
  const source = opts.source ?? "all";
  const picked = source === "picked" ? nonBlank(opts.slugs) : null;
  if (picked && picked.length === 0) return []; // nothing chosen → render nothing

  const data = await commerceRequest<ProductCategoriesQuery>(
    ProductCategoriesDocument,
    categoryVars(source, picked, opts.first),
    [COMMERCE_TAGS.categories],
  );
  const cards = (data.productCategories?.nodes ?? []).map(toCategoryCard);
  return picked ? orderBySlugs(cards, picked) : cards;
}

// ── configurable product carousel ───────────────────────────────────────────
export type ProductSource = "category" | "newest" | "bestselling" | "featured" | "handpicked";

// POPULARITY = Woo's total_sales ordering (confirmed on this build) — the "best sellers" source.
const POPULARITY: ProductsOrderbyInput[] = [{ field: "POPULARITY", order: "DESC" }];

// Over-fetch (a slug may be unpublished/hidden) then reorder to the editor's pick order.
async function handpicked(slugs: string[], count: number): Promise<ProductCard[]> {
  if (!slugs.length) return [];
  const products = await getFilteredProducts({}, Math.max(count, slugs.length), { slugIn: slugs });
  return orderBySlugs(products, slugs).slice(0, count);
}

export async function getMerchandisedProducts(opts: {
  source: ProductSource;
  categorySlugs?: string[];
  productSlugs?: string[];
  count?: number;
}): Promise<ProductCard[]> {
  const count = opts.count ?? 8;
  switch (opts.source) {
    case "category": {
      const cats = nonBlank(opts.categorySlugs);
      return cats.length ? getFilteredProducts({ type: cats, sort: "newest" }, count) : [];
    }
    case "bestselling":
      return getFilteredProducts({}, count, { orderby: POPULARITY });
    case "featured":
      return getFilteredProducts({}, count, { featured: true });
    case "handpicked":
      return handpicked(nonBlank(opts.productSlugs), count);
    case "newest":
    default:
      return getFilteredProducts({ sort: "newest" }, count);
  }
}
