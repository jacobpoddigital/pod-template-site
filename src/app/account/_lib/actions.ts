"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { requireUser } from "@/app/(auth)/_lib/guard";
import {
  getCustomerOrder,
  updateCustomerAddresses,
  updateCustomerDetails,
  updateCustomerPassword,
} from "@/lib/commerce/customer";
import { addItem, StoreApiError } from "@/lib/commerce/cart";
import { updateCustomer } from "@/lib/commerce/checkout";
import type { Address } from "@/lib/commerce/checkout";

// Account Server Actions — mutate the Woo customer (addresses / details / password) + reorder a past
// order into the cart. Every action re-asserts the session (requireUser) AND a same-origin check
// (CSRF defence, paired with the auth module's pattern). Zod validates server-side. Generic → M5.

export type AccountActionState = { ok: boolean; error?: string; done?: boolean };
export type ReorderState = { ok: boolean; added: number; skipped: number; error?: string };

/** Reject cross-site POSTs (mirror of the auth module's guard). */
async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const host = h.get("host");
  const origin = h.get("origin");
  if (origin) {
    if (new URL(origin).host !== host) throw new Error("Cross-origin request rejected.");
    return;
  }
  const referer = h.get("referer");
  if (referer && new URL(referer).host !== host) throw new Error("Cross-origin request rejected.");
}

const addressSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  address1: z.string().trim().min(1, "Address is required."),
  address2: z.string().optional(),
  city: z.string().trim().min(1, "Town / city is required."),
  postcode: z.string().trim().min(1, "Postcode is required."),
  country: z.string().trim().min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
});

/** Save billing + shipping to the Woo customer, then push them to the cart session so an in-progress
 *  cart re-prices delivery (shares the checkout update-customer → re-quote helper). */
export async function saveAddressesAction(billing: Address, shipping: Address): Promise<AccountActionState> {
  await requireUser("/account/addresses");
  await assertSameOrigin();
  const b = addressSchema.safeParse(billing);
  const s = addressSchema.safeParse(shipping);
  if (!b.success) return { ok: false, error: b.error.issues[0]?.message ?? "Check the billing address." };
  if (!s.success) return { ok: false, error: s.error.issues[0]?.message ?? "Check the shipping address." };
  try {
    await updateCustomerAddresses(b.data, s.data);
  } catch {
    return { ok: false, error: "Couldn't save your addresses — please try again." };
  }
  // Best-effort re-quote: keeps an active cart's delivery in sync with the new address. An empty
  // cart / no shippable items simply no-ops — never fail the save on it.
  try {
    await updateCustomer(b.data, s.data);
  } catch {
    /* no active cart or nothing shippable — fine */
  }
  return { ok: true, done: true };
}

const detailsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email."),
});

export async function saveDetailsAction(input: { firstName: string; lastName: string; email: string }): Promise<AccountActionState> {
  await requireUser("/account/details");
  await assertSameOrigin();
  const parsed = detailsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };
  try {
    await updateCustomerDetails(parsed.data);
  } catch {
    return { ok: false, error: "Couldn't update your details — please try again." };
  }
  return { ok: true, done: true };
}

const passwordSchema = z
  .object({ password: z.string().min(8, "Use at least 8 characters."), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match.", path: ["confirm"] });

export async function changePasswordAction(input: { password: string; confirm: string }): Promise<AccountActionState> {
  await requireUser("/account/details");
  await assertSameOrigin();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the passwords." };
  try {
    await updateCustomerPassword(parsed.data.password);
  } catch {
    return { ok: false, error: "Couldn't change your password — please try again." };
  }
  return { ok: true, done: true };
}

/** Add every line of a past order back to the cart. Out-of-stock / unavailable lines are skipped and
 *  reported (added/skipped counts) rather than failing the whole reorder. The client then opens the
 *  cart drawer. */
export async function reorderAction(orderId: number): Promise<ReorderState> {
  await requireUser("/account/orders");
  await assertSameOrigin();
  let order;
  try {
    order = await getCustomerOrder(orderId);
  } catch {
    return { ok: false, added: 0, skipped: 0, error: "Couldn't load that order." };
  }
  if (!order) return { ok: false, added: 0, skipped: 0, error: "Order not found." };

  let added = 0;
  let skipped = 0;
  for (const line of order.lines) {
    if (!line.addId) {
      skipped += 1;
      continue;
    }
    try {
      await addItem(line.addId, line.quantity);
      added += 1;
    } catch (err) {
      if (err instanceof StoreApiError) skipped += 1; // OOS / no longer purchasable — skip, keep going
      else throw err;
    }
  }
  if (added === 0) {
    return { ok: false, added, skipped, error: "None of these items are available to reorder right now." };
  }
  return { ok: true, added, skipped };
}
