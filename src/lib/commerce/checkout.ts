import "server-only";
import { cookies } from "next/headers";
import { storeApiWrite, clearCartSession, type Cart } from "./cart";
import { formatMoney, type CartCurrency } from "./config";

// CHECKOUT (M3 — the money path, ADR 0017). Store API write layer, sharing the cart's Cart-Token +
// Nonce session (see cart.ts). POC gateway = **Cheque** (offline): places an `on-hold` order with NO
// payment processing — no card data, no PCI, no Stripe. The real production money path is Stripe
// hosted checkout (still separate M3); this proves the full cart→order flow end-to-end.
//
// Flow: updateCustomer(address) → shipping quotes · selectShippingRate(id) → POST /checkout (cheque)
// → order placed. All proven on local Woo 10.8.1 (order on-hold, payment_result success).

const LAST_ORDER_COOKIE = "stride_last_order";

// ── Store API shapes (only what we use) ─────────────────────────────────────
type ApiTotals = {
  total_price: string;
  total_shipping: string | null;
  total_tax: string | null;
  total_items: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
};
type ApiRate = { rate_id: string; name: string; price: string; selected: boolean };
type ApiShippingPackage = { shipping_rates: ApiRate[] };
type ApiCartWithRates = { totals: ApiTotals; shipping_rates?: ApiShippingPackage[]; needs_shipping?: boolean };
type ApiOrder = {
  order_id: number;
  status: string;
  order_key: string;
  payment_result?: { payment_status?: string; redirect_url?: string };
};

// ── view types ──────────────────────────────────────────────────────────────
export type Address = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
  country: string; // ISO-2, e.g. "GB"
  email?: string;
  phone?: string;
};
export type ShippingRate = { rateId: string; name: string; price: string; selected: boolean };
export type CheckoutTotals = { total: string; shipping: string | null; tax: string | null; needsShipping: boolean };
export type CheckoutQuote = { rates: ShippingRate[]; totals: CheckoutTotals };
export type PlacedOrder = { orderId: number; status: string; orderKey: string; paymentStatus: string | null };
/** Minimal order summary persisted to a cookie for the confirmation page (server-truthful at place time). */
export type LastOrder = { orderId: number; status: string; total: string; email: string; itemCount: number };

const currencyOf = (t: ApiTotals): CartCurrency => ({
  prefix: t.currency_prefix ?? "",
  suffix: t.currency_suffix ?? "",
  minorUnit: t.currency_minor_unit ?? 2,
});

function adaptQuote(api: ApiCartWithRates): CheckoutQuote {
  const c = currencyOf(api.totals);
  const pkg = api.shipping_rates?.[0];
  const rates: ShippingRate[] = (pkg?.shipping_rates ?? []).map((r) => ({
    rateId: r.rate_id,
    name: r.name,
    price: Number(r.price) === 0 ? "Free" : formatMoney(Number(r.price), c),
    selected: r.selected,
  }));
  return {
    rates,
    totals: {
      total: formatMoney(Number(api.totals.total_price ?? 0), c),
      shipping: api.totals.total_shipping != null ? formatMoney(Number(api.totals.total_shipping), c) : null,
      tax: api.totals.total_tax != null ? formatMoney(Number(api.totals.total_tax), c) : null,
      needsShipping: api.needs_shipping ?? false,
    },
  };
}

const toApiAddress = (a: Address) => ({
  first_name: a.firstName,
  last_name: a.lastName,
  address_1: a.address1,
  address_2: a.address2 ?? "",
  city: a.city,
  postcode: a.postcode,
  country: a.country,
  ...(a.email ? { email: a.email } : {}),
  ...(a.phone ? { phone: a.phone } : {}),
});

/** Push the customer address → Woo computes shipping quotes + tax. Returns rates + totals. */
export async function updateCustomer(billing: Address, shipping: Address): Promise<CheckoutQuote> {
  const api = await storeApiWrite<ApiCartWithRates>("/cart/update-customer", {
    billing_address: toApiAddress(billing),
    shipping_address: toApiAddress(shipping),
  });
  return adaptQuote(api);
}

/** Choose a shipping rate (re-quotes totals incl. the chosen delivery cost). */
export async function selectShippingRate(rateId: string): Promise<CheckoutQuote> {
  const api = await storeApiWrite<ApiCartWithRates>("/cart/select-shipping-rate", { rate_id: rateId });
  return adaptQuote(api);
}

/**
 * Place the order via the chosen payment method (POC: "cheque"). Wipes the cart session + records a
 * `stride_last_order` cookie for the confirmation page, then returns the placed-order summary.
 */
export async function placeOrder(args: {
  billing: Address;
  shipping: Address;
  paymentMethod: string;
  note?: string;
  total: string;
  itemCount: number;
}): Promise<PlacedOrder> {
  const api = await storeApiWrite<ApiOrder>("/checkout", {
    billing_address: toApiAddress(args.billing),
    shipping_address: toApiAddress(args.shipping),
    payment_method: args.paymentMethod,
    ...(args.note ? { customer_note: args.note } : {}),
  });
  // Order placed — persist a confirmation summary, then clear the cart session.
  const jar = await cookies();
  const last: LastOrder = {
    orderId: api.order_id,
    status: api.status,
    total: args.total,
    email: args.billing.email ?? "",
    itemCount: args.itemCount,
  };
  jar.set(LAST_ORDER_COOKIE, JSON.stringify(last), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30, // 30 min — long enough to view the confirmation
  });
  await clearCartSession();
  return {
    orderId: api.order_id,
    status: api.status,
    orderKey: api.order_key,
    paymentStatus: api.payment_result?.payment_status ?? null,
  };
}

/** Reads (and does NOT clear) the last-order summary for the confirmation page. */
export async function getLastOrder(): Promise<LastOrder | null> {
  const raw = (await cookies()).get(LAST_ORDER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastOrder;
  } catch {
    return null;
  }
}

// Re-exported so the checkout page can read the cart without a second import path.
export type { Cart };
