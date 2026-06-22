import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/commerce/products";

// On-demand product detail for the listing QUICK-VIEW modal. The listing card only carries
// `ProductCard` (no gallery/variations), so the modal fetches the full `ProductDetail` here when
// it opens — keeping the listing payload lean while the quick-view shows gallery + size picker.
// Read-only catalogue data (the underlying WooGraphQL fetch is tag-cached); short shared-cache TTL
// so repeat opens are cheap without going stale.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" },
  });
}
