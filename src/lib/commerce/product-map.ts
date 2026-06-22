// GraphQL-node → domain mappers for the product DETAIL (PDP) shape. Split out of `products.ts` to
// keep that module under the size budget; these are pure adapters with no I/O. Imported back by
// `getProductBySlug`. (Type-only imports from `./products` are erased, so there's no runtime cycle.)
import { stockState, backorderMode } from "./pricing";
import type { ProductBySlugQuery } from "./generated/graphql";
// Type-only imports from `./products` are erased, so there's no runtime cycle (products.ts imports
// these mappers as values). `kindFromType` is duplicated here (tiny) rather than value-importing
// `productKind` to keep that one-directional.
import type { ProductCard, ProductDetail, ProductKind, ProductImage, ProductOption, ProductReview, ProductVariation } from "./products";

const kindFromType = (type: string | null | undefined): ProductKind =>
  type === "VARIABLE" ? "variable" : type === "EXTERNAL" ? "external" : type === "GROUPED" ? "grouped" : "simple";

// null-coalesce a possibly-undefined field to null. Kept as a helper (not inline `?? null`) so the
// builders below don't blow the cyclomatic-complexity lint ceiling on their many nullable fields.
const nn = <T>(v: T | null | undefined): T | null => v ?? null;

type ProductNode = NonNullable<ProductBySlugQuery["product"]>;
// The four PDP node shapes, discriminated by a field unique to each. RichNode = Variable | Simple
// (the "shoe" PDP: pricing/stock/gallery/reviews/specs — keyed on `soldIndividually`, queried only
// there). DetailNode = Variable only (`variations`). ExternalNode = External (`externalUrl`).
// GroupNode = Grouped (`products` child connection).
export type RichNode = Extract<ProductNode, { soldIndividually: boolean | null }>;
export type DetailNode = Extract<ProductNode, { variations: unknown }>;
export type ExternalNode = Extract<ProductNode, { externalUrl: unknown }>;
export type GroupNode = Extract<ProductNode, { products: unknown }>;

export const toImage = (
  i: { sourceUrl: string | null; altText: string | null } | null | undefined,
  fallbackAlt: string,
): ProductImage | null => (i?.sourceUrl ? { url: i.sourceUrl, alt: i.altText ?? fallbackAlt } : null);

export const firstTerm = (conn: { nodes: Array<{ name: string | null }> } | null | undefined): string | null =>
  conn?.nodes?.[0]?.name ?? null;

// Shared node→view field adapters (keep adaptCard / buildShoeDetail flat + under the complexity budget).
type TermConn = { nodes: Array<{ name: string | null }> } | null | undefined;
type PricedNode = {
  price: string | null; regularPrice?: string | null; salePrice?: string | null;
  onSale?: boolean | null; stockStatus?: string | null; stockQuantity?: number | null;
};
type SpecNode = {
  allPaDrop?: TermConn; allPaCushioning?: TermConn; allPaPronation?: TermConn;
  weight?: string | null; averageRating?: number | null; reviewCount?: number | null;
};

export function pricingFields(n: PricedNode) {
  const state = stockState(n.stockStatus);
  return { price: n.price, regularPrice: n.regularPrice ?? null, salePrice: n.salePrice ?? null,
    onSale: Boolean(n.onSale), inStock: state !== "OUT_OF_STOCK", stockStatus: state, stockQuantity: n.stockQuantity ?? null };
}

export const specFields = (n: SpecNode) => ({
  drop: firstTerm(n.allPaDrop), cushioning: firstTerm(n.allPaCushioning), pronation: firstTerm(n.allPaPronation),
  weightGrams: n.weight ?? null, rating: n.averageRating ?? null, reviewCount: n.reviewCount ?? null,
});

export const termNames = (conn: { nodes: Array<{ name: string | null }> } | null | undefined): string[] =>
  (conn?.nodes ?? []).map((n) => n.name).filter((n): n is string => Boolean(n));

export const mapCategories = (
  conn: { nodes: Array<{ name: string | null; slug: string | null }> } | null,
): { name: string; slug: string }[] =>
  (conn?.nodes ?? []).map((c) => ({ name: c.name ?? "", slug: c.slug ?? "" }));

export const mapGallery = (node: RichNode): ProductImage[] =>
  (node.galleryImages?.nodes ?? [])
    .map((g) => toImage(g, node.name ?? "Product"))
    .filter((x): x is ProductImage => Boolean(x));

// Only attributes flagged for variation (size + width) are buyable selectors. The taxonomy pivot
// added pa_drop/cushioning/etc as GLOBAL spec attributes (variation:false) — those are facets +
// spec-table data, never size pickers.
export const mapOptions = (node: DetailNode): ProductOption[] =>
  (node.attributes?.nodes ?? [])
    .filter((a) => a.variation)
    .map((a) => ({
      name: a.name ?? "",
      values: (a.options ?? []).filter((o): o is string => Boolean(o)),
    }));

export const mapReviews = (node: RichNode): ProductReview[] =>
  (node.reviews?.edges ?? [])
    .map((e) => ({
      id: e.node.databaseId ?? 0,
      author: e.node.author?.node?.name ?? "Verified runner",
      rating: Math.round(e.rating ?? 0),
      // WooGraphQL renders the comment as a <p>-wrapped HTML fragment; strip to plain text.
      content: (e.node.content ?? "").replace(/<[^>]+>/g, "").trim(),
      date: e.node.date ?? "",
    }))
    .filter((r) => r.content);

export const mapVariations = (node: DetailNode): ProductVariation[] =>
  (node.variations?.nodes ?? []).map((v) => {
    const state = stockState(v.stockStatus);
    return {
      id: v.databaseId,
      name: v.name ?? "",
      price: v.price,
      regularPrice: v.regularPrice ?? null,
      salePrice: v.salePrice ?? null,
      onSale: Boolean(v.onSale),
      inStock: state !== "OUT_OF_STOCK",
      stockStatus: state,
      stockQuantity: v.stockQuantity,
      backorders: backorderMode(v.backorders),
      lowStockAmount: v.lowStockAmount ?? null,
      image: toImage(v.image, node.name ?? "Product"),
      // Per-variation copy (Woo Variations tab "Description") — shown when this combo is resolved.
      description: (v.description ?? "").replace(/<[^>]+>/g, "").trim() || null,
      attributes: (v.attributes?.nodes ?? []).map((at) => ({ name: at.name ?? "", value: at.value ?? "" })),
    };
  });

// Merchant default variation (Woo Variations tab) → attribute name/value pairs the selector
// pre-selects. The selector matches case-insensitively against the option values, so a default
// that doesn't line up with a buyable value is simply ignored (no broken pre-selection).
export const mapDefaultAttributes = (
  conn: { nodes: Array<{ name: string | null; value: string | null }> } | null | undefined,
): { name: string; value: string }[] =>
  (conn?.nodes ?? [])
    .map((a) => ({ name: a.name ?? "", value: a.value ?? "" }))
    .filter((a) => a.name && a.value);

// Virtual / downloadable flags + the merchant default variation, for the Simple|Variable PDP.
// `downloadable` is a SimpleProduct-only field; `defaultAttributes` is Variable-only — both guarded.
export const digitalFields = (
  node: RichNode,
): { virtual: boolean; downloadable: boolean; defaultAttributes: { name: string; value: string }[] } => ({
  virtual: Boolean(node.virtual),
  downloadable: "downloadable" in node ? Boolean(node.downloadable) : false,
  defaultAttributes: "variations" in node ? mapDefaultAttributes(node.defaultAttributes) : [],
});

// colour value (normalised) → its representative variation image. A colourway shares one image
// across its sizes/widths, so we keep the FIRST variation per colour that carries an image — that
// powers the gallery swap when a shopper picks a colour. Empty when no variation has an image
// (the common POC case), so the gallery just behaves as before.
const isColourAttr = (name: string | null | undefined) => /colou?r/.test((name ?? "").toLowerCase());

// Shared "this isn't a shoe with specs/variations" defaults for the External + Grouped PDP shapes —
// they reuse the rich ProductDetail type but leave the spec/inventory/variation surface empty.
const NON_SHOE_DEFAULTS = {
  isVariable: false,
  featured: false,
  virtual: false,
  downloadable: false,
  defaultAttributes: [] as { name: string; value: string }[],
  sku: null as string | null,
  reviewsAllowed: false, // External/Grouped PDPs don't render the reviews section
  saleEndsAt: null as string | null,
  stockStatus: "IN_STOCK" as const,
  stockQuantity: null,
  inStock: true,
  drop: null,
  cushioning: null,
  pronation: null,
  weightGrams: null,
  rating: null,
  reviewCount: null,
  soldIndividually: false,
  backorders: "NO" as const,
  lowStockAmount: null,
  gender: null,
  widths: [] as string[],
  colours: [] as string[],
  gallery: [] as ProductImage[],
  options: [] as ProductOption[],
  variations: [] as ProductVariation[],
  colourImages: {} as Record<string, ProductImage>,
  reviews: [] as ProductReview[],
  externalUrl: null as string | null,
  externalButtonText: null as string | null,
  groupedProducts: [] as ProductCard[],
  tags: [] as { name: string; slug: string }[],
  upsellSlugs: [] as string[],
};

// Shared mappers for the merchandising fields present on the Product interface (so External +
// Grouped PDPs carry tags/up-sells too, not just the shoe PDP).
export const mapTags = (conn: { nodes: Array<{ name: string | null; slug: string | null }> } | null | undefined): { name: string; slug: string }[] =>
  (conn?.nodes ?? []).map((t) => ({ name: t.name ?? "", slug: t.slug ?? "" }));
export const mapUpsellSlugs = (conn: { nodes: Array<{ slug: string | null }> } | null | undefined): string[] =>
  (conn?.nodes ?? []).map((n) => n.slug).filter((s): s is string => Boolean(s));

// External/Affiliate PDP: product content + an outbound buy button (no cart, no variations).
export const buildExternalDetail = (node: ExternalNode): ProductDetail => ({
  ...NON_SHOE_DEFAULTS,
  id: node.databaseId,
  name: node.name ?? "",
  slug: node.slug ?? "",
  kind: "external",
  featured: Boolean(node.featured),
  sku: nn(node.sku),
  tags: mapTags(node.productTags),
  upsellSlugs: mapUpsellSlugs(node.upsell),
  image: toImage(node.image, node.name ?? "Product"),
  categories: mapCategories(node.productCategories),
  price: nn(node.price),
  regularPrice: nn(node.regularPrice),
  salePrice: nn(node.salePrice),
  onSale: Boolean(node.onSale),
  description: nn(node.description),
  shortDescription: nn(node.shortDescription),
  averageRating: nn(node.averageRating),
  rating: nn(node.averageRating),
  reviewCount: nn(node.reviewCount),
  brand: firstTerm(node.productBrands),
  externalUrl: nn(node.externalUrl),
  externalButtonText: nn(node.buttonText),
});

// Grouped PDP: a parent listing child products, each added to the cart individually (no parent add).
export const buildGroupedDetail = (node: GroupNode): ProductDetail => ({
  ...NON_SHOE_DEFAULTS,
  id: node.databaseId,
  name: node.name ?? "",
  slug: node.slug ?? "",
  kind: "grouped",
  featured: Boolean(node.featured),
  sku: nn(node.sku),
  tags: mapTags(node.productTags),
  upsellSlugs: mapUpsellSlugs(node.upsell),
  image: toImage(node.image, node.name ?? "Product"),
  categories: mapCategories(node.productCategories),
  price: node.price ?? null, // a range across the children
  regularPrice: null,
  salePrice: null,
  onSale: Boolean(node.onSale),
  description: node.description ?? null,
  shortDescription: node.shortDescription ?? null,
  averageRating: null,
  brand: null,
  groupedProducts: mapGroupedChildren(node),
});

// Grouped-product children → listing cards (rendered as an add-to-cart list on the parent PDP).
// Children are normally simple products; pricing/stock come from the simple|variable inline fragments.
const CHILD_SPEC_DEFAULTS = { featured: false, reviewsAllowed: false, downloadable: false, categories: [] as { name: string; slug: string }[], drop: null, cushioning: null, pronation: null, weightGrams: null, rating: null, reviewCount: null };
const NO_PRICING = { price: null, regularPrice: null, salePrice: null, onSale: false, inStock: true, stockStatus: "IN_STOCK" as const, stockQuantity: null, backorders: "NO" as const };

export const mapGroupedChildren = (node: GroupNode): ProductCard[] =>
  (node.products?.nodes ?? []).map((c) => {
    const base = {
      id: c.databaseId,
      name: c.name ?? "",
      slug: c.slug ?? "",
      kind: kindFromType(c.type),
      isVariable: c.type === "VARIABLE",
      image: toImage(c.image, c.name ?? "Product"),
      ...CHILD_SPEC_DEFAULTS,
    };
    if (!("price" in c)) return { ...base, ...NO_PRICING };
    const state = stockState(c.stockStatus);
    return {
      ...base,
      price: c.price,
      regularPrice: nn(c.regularPrice),
      salePrice: nn(c.salePrice),
      onSale: Boolean(c.onSale),
      inStock: state !== "OUT_OF_STOCK",
      stockStatus: state,
      stockQuantity: nn(c.stockQuantity),
      backorders: backorderMode(c.backorders),
    };
  });

export const buildColourImages = (variations: ProductVariation[]): Record<string, ProductImage> => {
  const map: Record<string, ProductImage> = {};
  for (const v of variations) {
    if (!v.image) continue;
    const colour = v.attributes.find((a) => isColourAttr(a.name))?.value;
    if (!colour) continue;
    const key = colour.trim().toLowerCase();
    if (!map[key]) map[key] = v.image;
  }
  return map;
};
