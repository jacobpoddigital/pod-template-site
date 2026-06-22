import { NextResponse } from "next/server";
import { getCart, updateItem, removeItem, StoreApiError } from "@/lib/commerce/cart";

// Cart for client chrome (header count badge + mini-cart drawer). The header lives in the root
// layout, so it can't call getCart() directly without opting every page — including fully-static
// ones — into dynamic rendering, and the `layout` boundary forbids importing app Server Actions.
// So the drawer reads (GET) and mutates (POST) through this route handler instead. Route handlers
// may set cookies, so the Cart-Token refresh persists. Never cached (cart is per-user + mutable).
export const dynamic = "force-dynamic";

export async function GET() {
  const cart = await getCart();
  return NextResponse.json(cart, { headers: { "Cache-Control": "no-store" } });
}

// Mini-cart drawer line mutation: { key, quantity } — quantity<=0 removes. Returns the refreshed
// cart so the drawer can re-render from server-authoritative totals.
export async function POST(req: Request) {
  let body: { key?: unknown; quantity?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const key = typeof body.key === "string" ? body.key : "";
  const quantity = Number(body.quantity);
  if (!key || Number.isNaN(quantity)) {
    return NextResponse.json({ error: "key and quantity required" }, { status: 400 });
  }
  try {
    const cart = quantity <= 0 ? await removeItem(key) : await updateItem(key, quantity);
    return NextResponse.json(cart, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    // Surface Woo's stock/quantity message to the shopper; mask raw nonce/HTTP failures.
    const message =
      e instanceof StoreApiError && e.code.startsWith("woocommerce_rest_") && !e.code.includes("nonce")
        ? e.message
        : "Couldn't update your bag — please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
