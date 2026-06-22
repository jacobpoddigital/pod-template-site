import "server-only";
import { cookies } from "next/headers";
import { reportError } from "@/lib/observability/report-error";
import { formatMoney, type CartCurrency } from "./config";

export type { CartCurrency } from "./config";

// Cart WRITES via the WooCommerce Store API + Cart-Token (workflow/14) — the sanctioned
// REST exception to ADR 0013 (cart/checkout only; reads stay on WooGraphQL). The token is
// the session: returned in a `Cart-Token` response header, sent back as a request header,
// persisted in an httpOnly cookie. Browser NEVER calls WP directly — only Server
// Actions / Server Components on this server do. Totals are read back server-authoritatively.
//
// ⚠ NONCE: Woo 10.8.1's Store API requires a `Nonce` header on every WRITE (add/update/remove/
// checkout) — a Cart-Token alone gives `401 woocommerce_rest_missing_nonce`, a stale nonce gives
// `403 woocommerce_rest_invalid_nonce`. The nonce is issued in the `Nonce` response header of any
// cart call (GET or write). We cache it in a cookie, refresh it from every response, prime it with a
// GET /cart when absent, and retry a write once on a nonce error. (Verified empirically, 2026-06-21.)

const CART_COOKIE = "stride_cart_token";
const NONCE_COOKIE = "stride_cart_nonce";
const NONCE_ERROR_CODES = new Set(["woocommerce_rest_missing_nonce", "woocommerce_rest_invalid_nonce"]);

function storeApiBase(): string {
  const gql = process.env.WPGRAPHQL_URL;
  if (!gql) throw new Error("WPGRAPHQL_URL is required for the commerce cart (Store API).");
  return gql.replace(/\/graphql\/?$/, "") + "/wp-json/wc/store/v1";
}

/** A Store API failure carrying Woo's machine code + human message, so callers can surface it. */
export class StoreApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "StoreApiError";
  }
}

// ── Store API response shapes (only the fields we use) ──────────────────────
type ApiTotals = {
  total_price: string;
  total_items: string;
  total_discount?: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
};
type ApiCoupon = { code: string; totals?: { total_discount?: string } };
type ApiQuantityLimits = { minimum: number; maximum: number; multiple_of: number; editable: boolean };
type ApiItem = {
  key: string;
  id: number; // product id (SIMPLE) or VARIATION id (variable) — not reliably the parent
  permalink: string; // parent product URL → we derive the parent slug for cart cross-sells
  name: string;
  quantity: number;
  quantity_limits?: ApiQuantityLimits;
  low_stock_remaining?: number | null;
  backorders_allowed?: boolean | null; // when true, "Only N left" is false scarcity (more is orderable)
  variation: { attribute: string; value: string }[];
  totals: { line_total: string };
  images?: { thumbnail?: string; src?: string; alt?: string }[];
};
type ApiError = { code?: string; message?: string };
type ApiCart = {
  items: ApiItem[];
  items_count: number;
  totals: ApiTotals;
  coupons?: ApiCoupon[];
  errors?: ApiError[];
};

// A cart line's `id` is the VARIATION id for variable products (cross-sells live on the PARENT),
// so we derive the parent product slug from the permalink (`…/product/<slug>/?…`) instead.
const slugFromPermalink = (url: string | undefined): string | null =>
  url?.match(/\/product\/([^/?#]+)/)?.[1] ?? null;

// ── flat view types for the UI ──────────────────────────────────────────────
/** A cart-level validation notice from Woo (item went OOS, quantity reduced, line removed, …). */
export type CartNotice = { code: string; message: string };
export type CartLine = {
  key: string;
  productSlug: string | null; // parent product slug (from the permalink) — powers cart cross-sell lookup
  name: string;
  quantity: number;
  options: { label: string; value: string }[];
  lineTotal: string;
  image: { url: string; alt: string } | null;
  /** Woo's per-line min/max/step (max = remaining purchasable). Powers stepper bounds + "Max N". */
  quantityLimits: { min: number; max: number; step: number; editable: boolean };
  /** "Only N left" for this line when Woo flags it low; null otherwise. */
  lowStockRemaining: number | null;
};
/** An applied discount coupon. */
export type CartCoupon = { code: string; discount: string };
export type Cart = {
  lines: CartLine[];
  itemCount: number;
  total: string;
  subtotalMinor: number; // numeric subtotal in minor units — for the free-shipping-threshold math
  currency: CartCurrency;
  coupons: CartCoupon[]; // applied discount codes
  discountTotal: string | null; // formatted total discount (null when none)
  errors: CartNotice[]; // Woo's authoritative cart-validation notices (surface, never silently drop)
  isEmpty: boolean;
};

const money = (minor: string, t: ApiTotals): string =>
  formatMoney(Number(minor), { prefix: t.currency_prefix ?? "", suffix: t.currency_suffix ?? "", minorUnit: t.currency_minor_unit ?? 2 });

const adaptCurrency = (t: ApiTotals): CartCurrency => ({
  prefix: t?.currency_prefix ?? "",
  suffix: t?.currency_suffix ?? "",
  minorUnit: t?.currency_minor_unit ?? 2,
});

function adaptLimits(lim: ApiQuantityLimits | undefined): CartLine["quantityLimits"] {
  return {
    min: lim?.minimum ?? 1,
    max: lim?.maximum ?? 9999,
    step: lim?.multiple_of ?? 1,
    editable: lim?.editable ?? true,
  };
}

function adaptImage(i: ApiItem): CartLine["image"] {
  const img = i.images?.[0];
  return img?.src ? { url: img.src, alt: img.alt ?? i.name } : null;
}

function adaptErrors(api: ApiCart): CartNotice[] {
  return (api.errors ?? [])
    .filter((e): e is Required<ApiError> => Boolean(e?.message))
    .map((e) => ({ code: e.code ?? "cart_error", message: e.message }));
}

function adaptCoupons(api: ApiCart): CartCoupon[] {
  return (api.coupons ?? []).map((c) => ({
    code: c.code.toUpperCase(),
    discount: money(c.totals?.total_discount ?? "0", api.totals),
  }));
}

function adaptLine(i: ApiItem, totals: ApiTotals): CartLine {
  return {
    key: i.key,
    productSlug: slugFromPermalink(i.permalink),
    name: i.name,
    quantity: i.quantity,
    options: (i.variation ?? []).map((v) => ({ label: v.attribute, value: v.value })),
    lineTotal: money(i.totals?.line_total ?? "0", totals),
    image: adaptImage(i),
    quantityLimits: adaptLimits(i.quantity_limits),
    // "Only N left" only when genuinely scarce: a positive remaining AND backorders NOT allowed.
    // Woo reports low_stock_remaining:0 for a silent-backorder line (e.g. backorders_allowed:true,
    // 0 stock) — surfacing that as "Only 0 left" is wrong; the item is freely orderable.
    lowStockRemaining:
      typeof i.low_stock_remaining === "number" && i.low_stock_remaining > 0 && !i.backorders_allowed
        ? i.low_stock_remaining
        : null,
  };
}

function adaptCart(api: ApiCart): Cart {
  const t = api.totals;
  const lines = (api.items ?? []).map((i) => adaptLine(i, t));
  // "Subtotal" = the ITEMS subtotal (`total_items`), NOT `total_price` (the grand total, which
  // includes shipping once a rate is selected on the session at checkout). Keeps the cart's subtotal
  // + the free-shipping nudge honest regardless of any shipping selection lingering on the cart token.
  const itemsSubtotal = t?.total_items ?? t?.total_price ?? "0";
  const discount = Number(t?.total_discount ?? 0);
  return {
    lines,
    itemCount: api.items_count ?? lines.reduce((n, l) => n + l.quantity, 0),
    total: money(itemsSubtotal, t),
    subtotalMinor: Number(itemsSubtotal),
    currency: adaptCurrency(t),
    coupons: adaptCoupons(api),
    discountTotal: discount > 0 ? money(String(discount), t) : null,
    errors: adaptErrors(api),
    isEmpty: lines.length === 0,
  };
}

// Mints/refreshes the nonce (and token) via a GET /cart, persisting both cookies. Returns the
// fresh nonce. Used to prime a first write and to recover from a nonce error.
async function primeSession(): Promise<string | undefined> {
  const jar = await cookies();
  const token = jar.get(CART_COOKIE)?.value;
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) headers.set("Cart-Token", token);
  const res = await fetch(`${storeApiBase()}/cart`, { method: "GET", headers, cache: "no-store" });
  persistSession(jar, res, token);
  return res.headers.get("Nonce") ?? undefined;
}

// Persists a refreshed Cart-Token + Nonce from a response into the cookie jar (Server Action /
// route-handler context only — Server Components can't set cookies, so callers pass persist=false).
function persistSession(jar: Awaited<ReturnType<typeof cookies>>, res: Response, prevToken?: string): void {
  const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
  const token = res.headers.get("Cart-Token");
  if (token && token !== prevToken) jar.set(CART_COOKIE, token, { ...opts, maxAge: 60 * 60 * 24 * 14 });
  const nonce = res.headers.get("Nonce");
  if (nonce) jar.set(NONCE_COOKIE, nonce, { ...opts, maxAge: 60 * 60 * 12 }); // Woo nonce ~12h
}

// Core Store API call. Reads the token+nonce cookies, sends them, and (when persist) writes back
// any refreshed token/nonce. `write` calls require a nonce: we prime one if absent and retry once
// on a nonce error (the cached nonce can expire). `persist` MUST be false in a Server Component.
async function storeRequest<T = ApiCart>(
  path: string,
  init: RequestInit & { persist?: boolean; write?: boolean } = {},
): Promise<T> {
  const { persist, write, ...reqInit } = init;
  const jar = await cookies();

  const call = async (nonce?: string): Promise<Response> => {
    const token = jar.get(CART_COOKIE)?.value;
    const headers = new Headers(reqInit.headers);
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Cart-Token", token);
    if (nonce) headers.set("Nonce", nonce);
    const res = await fetch(`${storeApiBase()}${path}`, { ...reqInit, headers, cache: "no-store" });
    if (persist) persistSession(jar, res, token);
    return res;
  };

  let nonce = write ? (jar.get(NONCE_COOKIE)?.value ?? (await primeSession())) : undefined;
  let res = await call(nonce);

  // Recover once from an expired/missing nonce on a write (cached nonce went stale).
  if (write && res.status >= 400) {
    const code = await peekErrorCode(res);
    if (code && NONCE_ERROR_CODES.has(code)) {
      nonce = await primeSession();
      res = await call(nonce);
    }
  }

  if (!res.ok) {
    const { code, message } = await readError(res, path);
    const err = new StoreApiError(code, message, res.status);
    reportError(err, { scope: "commerce-cart", tags: [path, code] });
    throw err;
  }
  return (await res.json()) as T;
}

/**
 * Generic Store API POST write (nonce-aware, persists the refreshed token+nonce, retries once on a
 * nonce error). For the checkout/customer/shipping endpoints that share the cart session but return
 * non-Cart shapes. Call ONLY from Server Actions / route handlers. Throws `StoreApiError` on failure.
 */
export function storeApiWrite<T>(path: string, body: unknown): Promise<T> {
  return storeRequest<T>(path, { method: "POST", body: JSON.stringify(body), persist: true, write: true });
}

/** Wipes the cart session cookies (token + nonce) — e.g. after an order is placed. */
export async function clearCartSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(CART_COOKIE);
  jar.delete(NONCE_COOKIE);
}

// Reads a clone's error code without consuming the body (so the original can be retried/read again).
async function peekErrorCode(res: Response): Promise<string | null> {
  try {
    return ((await res.clone().json()) as ApiError)?.code ?? null;
  } catch {
    return null;
  }
}

async function readError(res: Response, path: string): Promise<{ code: string; message: string }> {
  try {
    const body = (await res.json()) as ApiError;
    if (body?.message) return { code: body.code ?? `http_${res.status}`, message: body.message };
  } catch {
    /* non-JSON body */
  }
  return { code: `http_${res.status}`, message: `Store API ${path} failed (${res.status}).` };
}

/** Read-only cart fetch for a Server Component render (does not set cookies). */
export async function getCart(): Promise<Cart> {
  const jar = await cookies();
  // No token yet = empty cart (a new token is minted on the first add, in a Server Action).
  if (!jar.get(CART_COOKIE)?.value)
    return { lines: [], itemCount: 0, total: "", subtotalMinor: 0, currency: { prefix: "", suffix: "", minorUnit: 2 }, coupons: [], discountTotal: null, errors: [], isEmpty: true };
  return adaptCart(await storeRequest("/cart", { method: "GET" }));
}

// ── mutations — call ONLY from Server Actions / route handlers (they persist token + nonce) ──
export async function addItem(variationId: number, quantity = 1): Promise<Cart> {
  return adaptCart(
    await storeRequest("/cart/add-item", {
      method: "POST",
      body: JSON.stringify({ id: variationId, quantity }),
      persist: true,
      write: true,
    }),
  );
}

export async function updateItem(key: string, quantity: number): Promise<Cart> {
  return adaptCart(
    await storeRequest("/cart/update-item", {
      method: "POST",
      body: JSON.stringify({ key, quantity }),
      persist: true,
      write: true,
    }),
  );
}

export async function removeItem(key: string): Promise<Cart> {
  // Cart-level remove-item (returns the full updated cart in one round-trip) — preferred over the
  // single-line `DELETE /cart/items/:key`, which returns 204 and would force a second GET.
  return adaptCart(
    await storeRequest("/cart/remove-item", {
      method: "POST",
      body: JSON.stringify({ key }),
      persist: true,
      write: true,
    }),
  );
}

export async function applyCoupon(code: string): Promise<Cart> {
  return adaptCart(await storeApiWrite<ApiCart>("/cart/apply-coupon", { code }));
}

export async function removeCoupon(code: string): Promise<Cart> {
  return adaptCart(await storeApiWrite<ApiCart>("/cart/remove-coupon", { code }));
}
