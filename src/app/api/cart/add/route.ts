import { NextResponse } from "next/server";
import { addItem, StoreApiError } from "@/lib/commerce/cart";

// New-item add for the mini-cart drawer / widget cart-bridge (docs/features/ecom/cart-bridges/pod-next.js
// in website-avatar — expects { id, quantity } and returns the refreshed cart). The sibling
// /api/cart route only mutates EXISTING lines by { key, quantity } — it has no way to add a
// product that isn't already in the cart, hence this separate route.
export const dynamic = "force-dynamic";

// Surface Woo's stock/quantity message to the shopper; mask raw nonce/HTTP failures.
function addErrorMessage(e: unknown): string {
  if (e instanceof StoreApiError && e.code.startsWith("woocommerce_rest_") && !e.code.includes("nonce")) {
    return e.message;
  }
  return "Couldn't add that to your bag — please try again.";
}

export async function POST(req: Request) {
  let body: { id?: unknown; quantity?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const id = Number(body.id);
  const quantity = body.quantity === undefined ? 1 : Number(body.quantity);
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "id and a positive quantity required" }, { status: 400 });
  }
  try {
    const cart = await addItem(id, quantity);
    return NextResponse.json(cart, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: addErrorMessage(e) }, { status: 502 });
  }
}
