"use server";

import { revalidatePath } from "next/cache";
import { addItem, updateItem, removeItem, applyCoupon, removeCoupon, StoreApiError } from "@/lib/commerce/cart";

// Cart mutations run server-side (Server Actions) — the browser never touches WP. Each
// persists the refreshed Cart-Token + Nonce cookies (see lib/commerce/cart) and revalidates /cart.

// Woo's machine error message is fine to show for stock/quantity problems, but raw nonce/HTTP
// failures read as gibberish to a shopper — fall back to a friendly line for those.
function addError(e: unknown): string {
  if (e instanceof StoreApiError && e.code.startsWith("woocommerce_rest_") && !e.code.includes("nonce")) {
    return e.message;
  }
  return "Couldn't add to bag — please try again.";
}

/** Typed — called from the PDP "Add to bag" client component. */
export async function addToCartAction(
  variationId: number,
  quantity = 1,
): Promise<{ ok: boolean; itemCount: number; error?: string }> {
  try {
    const cart = await addItem(variationId, quantity);
    revalidatePath("/cart");
    return { ok: true, itemCount: cart.itemCount };
  } catch (e) {
    return { ok: false, itemCount: 0, error: addError(e) };
  }
}

// The /cart steppers are form-native (work without JS); a write failure there is rare (Woo CLAMPS
// over-max qty rather than erroring) and the re-read cart surfaces Woo's authoritative `errors[]`.
// We swallow the throw so the page still re-renders the current server-truthful cart on failure.
/** Form-native — the /cart quantity stepper (hidden key + target quantity). */
export async function updateCartLine(formData: FormData): Promise<void> {
  const key = String(formData.get("key") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  if (!key) return;
  try {
    if (quantity <= 0) await removeItem(key);
    else await updateItem(key, quantity);
  } catch {
    /* re-render the server-truthful cart (with any cart.errors) below */
  }
  revalidatePath("/cart");
}

/** Apply a discount coupon to the cart session. Returns Woo's message on an invalid/ineligible code. */
export async function applyCouponAction(code: string): Promise<{ ok: boolean; error?: string }> {
  const trimmed = code.trim();
  if (!trimmed) return { ok: false, error: "Enter a discount code." };
  try {
    await applyCoupon(trimmed);
    revalidatePath("/cart");
    return { ok: true };
  } catch (e) {
    // Coupon errors carry a useful Woo message ("…does not exist", "…minimum spend", expired, etc.).
    const msg = e instanceof StoreApiError && e.message ? e.message.replace(/&quot;/g, '"') : "That code can't be applied.";
    return { ok: false, error: msg };
  }
}

/** Remove an applied coupon. */
export async function removeCouponAction(code: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await removeCoupon(code);
    revalidatePath("/cart");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't remove that code — please try again." };
  }
}

/** Form-native — the /cart remove button. */
export async function removeCartLine(formData: FormData): Promise<void> {
  const key = String(formData.get("key") ?? "");
  if (!key) return;
  try {
    await removeItem(key);
  } catch {
    /* re-render the server-truthful cart below */
  }
  revalidatePath("/cart");
}
