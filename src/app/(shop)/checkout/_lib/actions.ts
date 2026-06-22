"use server";

import { updateCustomer, selectShippingRate, placeOrder, type Address, type CheckoutQuote } from "@/lib/commerce/checkout";
import { StoreApiError } from "@/lib/commerce/cart";

// Checkout Server Actions (M3 money path, ADR 0017) — the browser never touches WP. Each shares the
// cart's Cart-Token + Nonce session. Woo's machine messages are fine for address/stock problems;
// raw nonce/HTTP failures get a friendly fallback.
function friendly(e: unknown, fallback: string): string {
  if (e instanceof StoreApiError && e.code.startsWith("woocommerce_rest_") && !e.code.includes("nonce")) {
    return e.message;
  }
  return fallback;
}

/** Push the address(es) → Woo shipping quotes + tax. Ships to `shipping` (defaults to billing). */
export async function quoteAction(billing: Address, shipping?: Address): Promise<{ ok: boolean; quote?: CheckoutQuote; error?: string }> {
  try {
    return { ok: true, quote: await updateCustomer(billing, shipping ?? billing) };
  } catch (e) {
    return { ok: false, error: friendly(e, "Couldn't calculate delivery — check your address and try again.") };
  }
}

/** Choose a delivery rate (re-quotes totals). */
export async function selectRateAction(rateId: string): Promise<{ ok: boolean; quote?: CheckoutQuote; error?: string }> {
  try {
    return { ok: true, quote: await selectShippingRate(rateId) };
  } catch (e) {
    return { ok: false, error: friendly(e, "Couldn't select that delivery option.") };
  }
}

/** Place the order via the chosen gateway (POC: cheque). Ships to `shipping` (defaults to billing). */
export async function placeOrderAction(args: {
  billing: Address;
  shipping?: Address;
  paymentMethod: string;
  note?: string;
  total: string;
  itemCount: number;
}): Promise<{ ok: boolean; orderId?: number; error?: string }> {
  try {
    const order = await placeOrder({
      billing: args.billing,
      shipping: args.shipping ?? args.billing,
      paymentMethod: args.paymentMethod,
      note: args.note,
      total: args.total,
      itemCount: args.itemCount,
    });
    return { ok: true, orderId: order.orderId };
  } catch (e) {
    return { ok: false, error: friendly(e, "Couldn't place your order — please try again.") };
  }
}
