import { NextResponse } from "next/server";
import { getCart } from "@/lib/commerce/cart";
import { getCartCrossSells } from "@/lib/commerce/related";

// Cart CROSS-SELLS for the mini-cart drawer (the header lives in the root layout, which can't import
// app/commerce components or call getCart() directly without opting every page into dynamic render).
// Lazy: the drawer fetches this only when it OPENS — not on the badge's focus/poll — so the extra
// WooGraphQL hop never rides the frequent /api/cart poll. Returns ProductCard[] (possibly empty).
export const dynamic = "force-dynamic";

export async function GET() {
  const cart = await getCart();
  if (cart.isEmpty) return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  const slugs = [...new Set(cart.lines.map((l) => l.productSlug).filter((s): s is string => Boolean(s)))];
  const products = await getCartCrossSells(slugs, 6);
  return NextResponse.json(products, { headers: { "Cache-Control": "no-store" } });
}
