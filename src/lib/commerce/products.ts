import "server-only";
import { commerceRequest } from "./client";
import {
  ProductsFilteredDocument,
  ProductBySlugDocument,
  ShopFacetsDocument,
  FacetUniverseDocument,
} from "./generated/graphql";
import type {
  ProductsFilteredQuery,
  ProductBySlugQuery,
  ShopFacetsQuery,
  FacetUniverseQuery,
  ProductAttributeEnum,
  ProductAttributeQueryInput,
  ProductsOrderbyInput,
} from "./generated/graphql";
import { computeFacets } from "./facet-logic";
import type { SortKey, ShopFilters, Facet, ShopFacets, FacetMembership, FacetKey } from "./facet-logic";
import { stockState, backorderMode, type StockState, type BackorderMode } from "./pricing";
import { toImage, firstTerm, termNames, mapCategories, mapGallery, mapOptions, mapReviews, mapVariations, buildColourImages, buildExternalDetail, buildGroupedDetail, mapTags, mapUpsellSlugs, digitalFields, pricingFields, specFields } from "./product-map";
import type { RichNode } from "./product-map";

// Catalog visibility is honoured SERVER-SIDE via the `visibility` where-arg (see filtersToVariables):
// CATALOG = visible-in-catalog (shop), SEARCH = visible-in-search. (The per-node `catalogVisibility`
// FIELD is unreliable on this WooGraphQL build — it returns null — so we filter at the query, not the
// client; this also keeps hidden products out of pagination/facet counts for free.)

// Commerce READ layer (WooGraphQL, ADR 0013). SSG/ISR-first; WRITES go via Store API (workflow/14).
// ONE products query (ProductsFiltered) subsumes the plain list (all where-args optional).
export const COMMERCE_TAGS = {
  products: "commerce:products",
  categories: "commerce:product-categories",
} as const;

export type ProductImage = { url: string; alt: string };

// The four WooCommerce storefront product types we support. `external` (affiliate — buy button →
// outbound URL, no cart) and `grouped` (a parent listing child products, each added individually)
// have distinct buy paths from simple/variable. (Virtual/Downloadable are flags on simple/variable.)
export type ProductKind = "simple" | "variable" | "external" | "grouped";
export const productKind = (type: string | null | undefined): ProductKind =>
  type === "VARIABLE" ? "variable" : type === "EXTERNAL" ? "external" : type === "GROUPED" ? "grouped" : "simple";

export type ProductCard = {
  id: number;
  name: string;
  slug: string;
  kind: ProductKind;
  price: string | null;
  regularPrice: string | null; // struck-through "was" price when on sale (may be a range)
  salePrice: string | null;
  onSale: boolean;
  inStock: boolean;
  stockStatus: StockState; // IN_STOCK | OUT_OF_STOCK | ON_BACKORDER
  stockQuantity: number | null; // parent-level qty (simple products / managed parents)
  backorders: BackorderMode; // NO | NOTIFY | YES — so the card/grouped StockNote can suppress a SILENT (YES) backorder
  isVariable: boolean; // simple vs variable — drives the buy path (selector vs direct add)
  featured: boolean; // Woo `featured` flag — powers a "Featured" badge / homepage rail
  reviewsAllowed: boolean; // per-product reviews toggle — suppresses the card star rating when off
  downloadable: boolean; // Woo `downloadable` flag — a digital good (file delivered after purchase)
  image: ProductImage | null;
  categories: { name: string; slug: string }[];
  // Spec signals for the listing card (the approved wireframe shows chips + drop/weight + rating).
  drop: string | null; // e.g. "5mm"
  cushioning: string | null; // e.g. "Max"
  pronation: string | null; // e.g. "Neutral"
  weightGrams: string | null; // native Woo weight, unit g
  rating: number | null; // averageRating
  reviewCount: number | null;
};
export type ProductVariation = {
  id: number;
  name: string;
  price: string | null;
  regularPrice: string | null;
  salePrice: string | null;
  onSale: boolean;
  inStock: boolean;
  stockStatus: StockState;
  stockQuantity: number | null;
  backorders: BackorderMode; // per-variation backorder policy (NO | NOTIFY | YES)
  lowStockAmount: number | null; // per-variation Woo low_stock_amount (null → global default)
  image: ProductImage | null; // per-variation (colourway) image — powers the gallery colour swap
  description: string | null; // per-variation copy shown when this exact variation is resolved
  attributes: { name: string; value: string }[];
};
export type ProductOption = { name: string; values: string[] };
export type ProductReview = { id: number; author: string; rating: number; content: string; date: string };
export type ProductDetail = ProductCard & {
  description: string | null;
  shortDescription: string | null;
  averageRating: number | null;
  reviewCount: number | null;
  sku: string | null; // Woo SKU — shown on the PDP (helps support / catalogue lookups)
  saleEndsAt: string | null; // raw Woo `dateOnSaleTo` — drives the "Sale ends {date}" urgency line
  virtual: boolean; // Woo `virtual` flag — no shipping (hide delivery/returns copy on the PDP)
  // Merchant default variation (Woo Variations tab): name→value pairs the selector pre-selects so
  // the PDP opens on the chosen combo, not blank. Empty when the merchant set no defaults.
  defaultAttributes: { name: string; value: string }[];
  // (reviewsAllowed lives on ProductCard — it gates the card rating, the quick-view rating, and the
  //  full PDP reviews section.)
  // Inventory policy (parent-level): drives the qty stepper + backorder/low-stock messaging.
  soldIndividually: boolean; // qty locked to 1 (hide stepper)
  backorders: BackorderMode; // NO | NOTIFY | YES
  lowStockAmount: number | null; // Woo low_stock_amount (null → global default)
  // Spec signals (the adviser PDP shows the full technical table + visual bars).
  brand: string | null;
  gender: string | null;
  widths: string[]; // standard / wide
  colours: string[];
  gallery: ProductImage[];
  options: ProductOption[];
  variations: ProductVariation[];
  // Normalised colour value → its colourway image (derived from per-variation images). Drives the
  // PDP gallery swap on colour select; empty when no variation carries an image.
  colourImages: Record<string, ProductImage>;
  reviews: ProductReview[];
  // Merchandising: product tags (PDP chips + `/shop/tag/{slug}` archive) + merchant-curated up-sell
  // product slugs (rendered merchant-first, filled with algorithmic related — see `related.ts`).
  tags: { name: string; slug: string }[];
  upsellSlugs: string[];
  // External/Affiliate: outbound buy link + button copy (no cart). Null for other kinds.
  externalUrl: string | null;
  externalButtonText: string | null;
  // Grouped: the child products listed on the parent PDP, each added to cart individually.
  groupedProducts: ProductCard[];
};

// ── filtering ────────────────────────────────────────────────────────────
// Filter/facet TYPES + count maths live in the pure `facet-logic` module (shared with the
// client staged preview). Re-exported here so existing `@/lib/commerce/products` imports keep working.
export type { SortKey, ShopFilters, Facet, ShopFacets } from "./facet-logic";

const ORDERBY: Record<SortKey, ProductsOrderbyInput[]> = {
  featured: [{ field: "MENU_ORDER", order: "ASC" }], // Woo manual order ("Default sorting")
  newest: [{ field: "DATE", order: "DESC" }],
  rating: [{ field: "RATING", order: "DESC" }],
  "price-asc": [{ field: "PRICE", order: "ASC" }],
  "price-desc": [{ field: "PRICE", order: "DESC" }],
  name: [{ field: "NAME", order: "ASC" }],
};

type FilteredNode = NonNullable<ProductsFilteredQuery["products"]>["nodes"][number];

// Variable AND Simple products both carry `productCategories` + pricing/stock (the listing
// query fragments are identical) — inline `in`-narrowing covers both; the else branch is
// External/Group products (no price/stock).
function adaptCard(node: FilteredNode): ProductCard {
  const base = {
    id: node.databaseId,
    name: node.name ?? "",
    slug: node.slug ?? "",
    kind: productKind(node.type),
    backorders: backorderMode("backorders" in node ? node.backorders : null),
    isVariable: node.type === "VARIABLE",
    featured: Boolean(node.featured),
    reviewsAllowed: "reviewsAllowed" in node ? node.reviewsAllowed === true : false,
    downloadable: "downloadable" in node ? Boolean(node.downloadable) : false,
    image: toImage(node.image, node.name ?? "Product"),
  };
  if ("productCategories" in node) {
    return {
      ...base,
      ...pricingFields(node),
      ...specFields(node),
      categories: (node.productCategories?.nodes ?? []).map((c) => ({ name: c.name ?? "", slug: c.slug ?? "" })),
    };
  }
  const noSpecs = { drop: null, cushioning: null, pronation: null, weightGrams: null, rating: null, reviewCount: null };
  const noStock = { regularPrice: null, salePrice: null, stockStatus: "IN_STOCK" as StockState, stockQuantity: null };
  return { ...base, price: null, onSale: false, inStock: true, categories: [], ...noStock, ...noSpecs };
}

// Attribute facets → WooGraphQL `attributes` taxonomy queries (data-driven so adding a facet is
// one line, and the function stays flat). Each maps a ShopFilters key to its pa_ taxonomy.
const ATTR_TAXONOMIES: { key: FacetKey; taxonomy: ProductAttributeEnum }[] = [
  { key: "gender", taxonomy: "PA_GENDER" },
  { key: "drop", taxonomy: "PA_DROP" },
  { key: "cushioning", taxonomy: "PA_CUSHIONING" },
  { key: "pronation", taxonomy: "PA_PRONATION" },
  { key: "weight", taxonomy: "PA_WEIGHT" },
  { key: "width", taxonomy: "PA_WIDTH" },
  { key: "colour", taxonomy: "PA_COLOUR" },
];

function buildAttributes(f: ShopFilters): ProductAttributeQueryInput | null {
  const queries = ATTR_TAXONOMIES.flatMap(({ key, taxonomy }) => {
    const terms = f[key];
    return terms?.length ? [{ taxonomy, terms }] : [];
  });
  return queries.length ? { queries, relation: "AND" } : null;
}

const nonEmpty = (a?: string[]): string[] | null => (a && a.length ? a : null);

// Extra knobs the merchandising blocks need on top of the shop facets: a `featured`-only filter
// and an explicit `orderby` override (e.g. POPULARITY for a "best sellers" rail — not exposed as a
// shop SortKey). `slugIn` fetches an explicit slug set (merchant up-sells / hand-picked carousels).
export type ProductsQueryOpts = { slugIn?: string[]; featured?: boolean; orderby?: ProductsOrderbyInput[] };

function filtersToVariables(f: ShopFilters, first: number, opts: ProductsQueryOpts = {}): Record<string, unknown> {
  return {
    first,
    search: f.search || null,
    categoryIn: nonEmpty(f.type), // `type` (Daily/Stability/Racing/Trail) maps to product_cat
    productBrandIn: nonEmpty(f.brand),
    attributes: buildAttributes(f),
    minPrice: f.minPrice ?? null,
    maxPrice: f.maxPrice ?? null,
    stockStatus: f.inStock ? ["IN_STOCK"] : null,
    tagIn: nonEmpty(f.tag), // product_tag slugs — powers the /shop/tag/{slug} archive
    slugIn: nonEmpty(opts.slugIn), // explicit slug set — merchant up-sells / hand-picked carousel cards
    featured: opts.featured ? true : null, // null = no filter (Woo default); true = featured-only rail
    // Honour catalog visibility at the source: a keyword search shows search-visible products
    // (visible + search-only); every other listing shows catalog-visible (visible + shop-only).
    // Both exclude HIDDEN, so hidden products never leak into a listing, its pagination, or facets.
    visibility: f.search ? "SEARCH" : "CATALOG",
    orderby: opts.orderby ?? ORDERBY[f.sort ?? "newest"],
  };
}

export async function getFilteredProducts(
  f: ShopFilters = {},
  first = 48,
  opts: ProductsQueryOpts = {},
): Promise<ProductCard[]> {
  const data = await commerceRequest<ProductsFilteredQuery>(
    ProductsFilteredDocument,
    filtersToVariables(f, first, opts),
    [COMMERCE_TAGS.products],
  );
  return (data.products?.nodes ?? []).map(adaptCard);
}

/** Convenience wrapper (homepage curated picks, PDP static params). categoryIn = type slugs. */
export function getProducts(opts: { categoryIn?: string[]; first?: number } = {}): Promise<ProductCard[]> {
  return getFilteredProducts({ type: opts.categoryIn }, opts.first ?? 24);
}

const mapFacet = (conn: { nodes: Array<{ name: string | null; slug: string | null; count: number | null }> } | null): Facet[] =>
  (conn?.nodes ?? []).map((n) => ({ name: n.name ?? "", slug: n.slug ?? "", count: n.count ?? 0 }));

export async function getShopFacets(): Promise<ShopFacets> {
  const d = await commerceRequest<ShopFacetsQuery>(ShopFacetsDocument, {}, [
    COMMERCE_TAGS.products,
    COMMERCE_TAGS.categories,
  ]);
  return {
    gender: mapFacet(d.allPaGender),
    type: mapFacet(d.productCategories),
    brand: mapFacet(d.productBrands),
    drop: mapFacet(d.allPaDrop),
    cushioning: mapFacet(d.allPaCushioning),
    pronation: mapFacet(d.allPaPronation),
    weight: mapFacet(d.allPaWeight),
    width: mapFacet(d.allPaWidth),
    colour: mapFacet(d.allPaColour),
  };
}

// ── facet universe (every product's facet memberships + name + price) ──────
// Powers disjunctive counts + the client staged preview. Kept slim (slugs + name + numeric
// price) since it ships to the client — fine for a modest catalogue.
export async function getFacetUniverse(): Promise<FacetMembership[]> {
  const d = await commerceRequest<FacetUniverseQuery>(FacetUniverseDocument, {}, [COMMERCE_TAGS.products]);
  const slugs = (conn: { nodes: Array<{ slug: string | null }> } | null): string[] =>
    (conn?.nodes ?? []).map((n) => n.slug).filter((s): s is string => Boolean(s));
  return (d.products?.nodes ?? []).flatMap((n) =>
    "productCategories" in n
      ? [
          {
            gender: slugs(n.allPaGender),
            type: slugs(n.productCategories),
            brand: slugs(n.terms),
            drop: slugs(n.allPaDrop),
            cushioning: slugs(n.allPaCushioning),
            pronation: slugs(n.allPaPronation),
            weight: slugs(n.allPaWeight),
            width: slugs(n.allPaWidth),
            colour: slugs(n.allPaColour),
            inStock: n.stockStatus !== "OUT_OF_STOCK",
            name: n.name ?? "",
            price: parseFloat((n.price ?? "").replace(/[^0-9.]/g, "")) || 0,
          },
        ]
      : [],
  );
}

export type ShopData = {
  products: ProductCard[];
  facets: ShopFacets;
  universe: FacetMembership[]; // for the client staged preview
  labels: ShopFacets; // base facet term lists (zero counts) — client recomputes counts per draft
};

export async function getShopData(f: ShopFilters): Promise<ShopData> {
  const [products, labels, universe] = await Promise.all([getFilteredProducts(f), getShopFacets(), getFacetUniverse()]);
  // Disjunctive counts via the shared pure logic (identical maths on client + server).
  return { products, facets: computeFacets(universe, f, labels), universe, labels };
}

// ── product detail ──────────────────────────────────────────────────────
// GraphQL-node → domain mappers (RichNode/DetailNode + map*) live in `./product-map` to keep this
// module under the size budget. Simple products have no variations/options (non-variable buy path).
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const data = await commerceRequest<ProductBySlugQuery>(ProductBySlugDocument, { slug }, [COMMERCE_TAGS.products]);
  const node = data.product;
  // `onSale` present ⇒ a sellable PDP (Simple | Variable | External | Grouped). null/other → no PDP.
  if (!node || !("onSale" in node)) return null;
  // External (outbound buy button) + Grouped (child add-to-cart list) have their own builders.
  if ("externalUrl" in node) return buildExternalDetail(node);
  if ("products" in node) return buildGroupedDetail(node);
  // Remaining: the "shoe" PDP (Simple | Variable).
  return buildShoeDetail(node);
}

// Simple | Variable PDP. Simple has no variations/options → empty arrays drive the direct-add path.
function buildShoeDetail(node: RichNode): ProductDetail {
  const isVariable = "variations" in node;
  const variations = "variations" in node ? mapVariations(node) : [];
  return {
    id: node.databaseId,
    name: node.name ?? "",
    slug: node.slug ?? "",
    kind: isVariable ? "variable" : "simple",
    isVariable,
    featured: Boolean(node.featured),
    ...digitalFields(node),
    ...pricingFields(node),
    ...specFields(node),
    image: toImage(node.image, node.name ?? "Product"),
    categories: mapCategories(node.productCategories),
    description: node.description,
    shortDescription: node.shortDescription,
    averageRating: node.averageRating,
    sku: node.sku ?? null,
    // Reviews shown only when explicitly allowed. This WooGraphQL build returns `true` for an
    // open product and `null` (NOT false) when comment_status is closed, so `=== true` is the
    // robust gate (null/false → hidden) — verified against a seeded reviews-disabled product.
    reviewsAllowed: node.reviewsAllowed === true,
    saleEndsAt: node.dateOnSaleTo ?? null,
    externalUrl: null,
    externalButtonText: null,
    groupedProducts: [],
    soldIndividually: Boolean(node.soldIndividually),
    backorders: backorderMode(node.backorders),
    lowStockAmount: node.lowStockAmount ?? null,
    brand: firstTerm(node.productBrands),
    gender: firstTerm(node.allPaGender),
    widths: termNames(node.allPaWidth),
    colours: termNames(node.allPaColour),
    gallery: mapGallery(node),
    options: "variations" in node ? mapOptions(node) : [],
    variations,
    colourImages: buildColourImages(variations),
    reviews: mapReviews(node),
    tags: mapTags(node.productTags),
    upsellSlugs: mapUpsellSlugs(node.upsell),
  };
}

// Cross-sell / related-products ranking lives in `./related` (kept out of this module for length
// + focus; it imports from here, so import it directly: `@/lib/commerce/related`).
