import "server-only";
import { commerceRequest } from "./client";
import { ProductTagDocument } from "./generated/graphql";
import type { ProductTagQuery } from "./generated/graphql";
import { COMMERCE_TAGS } from "./products";

// Product-tag reads (the `/shop/tag/{slug}` archive). Split from products.ts to keep that module
// under the size budget; the listing itself reuses getShopData with a `tag` filter.

export type ProductTag = { name: string; slug: string; description: string | null; count: number | null };

/** Look up a single product_tag term by slug (name/description/count) for the `/shop/tag/{slug}`
 *  archive header + SEO. Returns null when the tag doesn't exist → the route 404s. */
export async function getProductTag(slug: string): Promise<ProductTag | null> {
  const d = await commerceRequest<ProductTagQuery>(ProductTagDocument, { slug }, [COMMERCE_TAGS.products]);
  const t = d.productTag;
  // 404 an unknown tag OR an existing tag with no published products (avoid thin/empty indexable
  // archive pages).
  if (!t || !t.count) return null;
  return { name: t.name ?? slug, slug: t.slug ?? slug, description: t.description ?? null, count: t.count ?? null };
}
