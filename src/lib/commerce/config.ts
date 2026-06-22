// Commerce module config (opt-in bolt-on — docs/commerce.md). One place for the build-level
// commerce choices that differ per client, so a site selects its behaviour here rather than
// forking components. No secrets.

/**
 * Listing pagination style — a BUILD-LEVEL choice (category-listing UX standard supports both).
 *  - "load-more": URL-backed cumulative "Load more" button (the agency default — Baymard:
 *    out-engages both infinite scroll and classic pagination). Page N shows the first N×SIZE.
 *  - "numbered":  classic numbered pages in a `<nav aria-label="Pagination">`, rendered top AND
 *    bottom of the grid. Page N shows only that page's window. Crawlable, deep-linkable, good
 *    for very large catalogues / users who want to jump.
 * Both are URL-driven (`?page=N`) off the SAME `_lib/pagination.ts` seam — switching is one line.
 */
export const PAGINATION_MODE: "load-more" | "numbered" = "load-more";

/**
 * Variable-product price display — a BUILD-LEVEL choice. WooGraphQL returns a variable product's
 * price as a min–max RANGE ("£169 – £174"); on sale this doubles up ("£169–£174" struck "£230–£235")
 * and reads noisy on cards.
 *  - "from":  collapse the range to the low end — "From £169" (struck "From £230", "−27%"). The
 *    agency default: scannable, matches how shoe/fashion stores present variant pricing.
 *  - "range": show Woo's full min–max range verbatim.
 * Only affects products whose price is actually a range; single-price (simple) products are
 * unchanged. The struck "was" + %-off are computed at the low end, consistent with "From {low}".
 */
export const PRICE_DISPLAY: "from" | "range" = "from";

/**
 * Low-stock display policy — mirrors Woo's "stock display format" store setting (which the GraphQL
 * layer doesn't expose, so we fix it per build).
 *  - "count": exact remaining — "Only 3 left" (the agency default — urgency + honesty).
 *  - "badge": generic "Low stock" with no number (when a client prefers not to reveal exact counts).
 *  - "none":  never surface a low-stock nudge.
 * Only governs the LOW-stock nudge; out-of-stock and backorder messaging are always shown. The
 * threshold itself comes from Woo's per-product `low_stock_amount` (else `LOW_STOCK_THRESHOLD`).
 */
export const STOCK_DISPLAY: "count" | "badge" | "none" = "count";

/**
 * Tax / VAT price-LABEL display — a BUILD-LEVEL choice. Woo's "Display prices in the shop/cart"
 * and "price suffix" settings (WooCommerce → Settings → Tax) decide whether prices read inclusive
 * or exclusive of tax and what suffix trails them — but WooGraphQL does NOT expose them, so (like
 * PRICE_DISPLAY / STOCK_DISPLAY) we fix the LABEL per build. Display only: the tax CALCULATION is
 * M3 (cart/checkout, Store-API server-authoritative totals).
 *  - "inc":  prices include tax → show an "inc. VAT" suffix (the agency default — UK B2C stores
 *    quote tax-inclusive prices by law; honest + matches Woo's typical UK config).
 *  - "ex":   prices exclude tax → show an "ex. VAT" suffix (B2B / trade catalogues).
 *  - "none": no tax suffix (tax-free goods, or a client who surfaces it only at checkout).
 * The suffix renders next to the price on the PDP buy-box, quick-view, and the cart summary — NOT
 * on dense listing cards (noise). Change the copy in `taxSuffix()` for a different tax name.
 */
export const TAX_DISPLAY: "inc" | "ex" | "none" = "inc";

/** Human price suffix for the active TAX_DISPLAY mode (null when no suffix should show). */
export function taxSuffix(): string | null {
  return TAX_DISPLAY === "inc" ? "inc. VAT" : TAX_DISPLAY === "ex" ? "ex. VAT" : null;
}

/**
 * Free-shipping-threshold merchandising nudge — a DISPLAY-ONLY progress bar in the cart that tells
 * the shopper how much more to spend to qualify for free delivery ("£12 away from free shipping").
 * Mirrors the TAX_DISPLAY pattern: a build-level constant, not a Woo read — the actual free-shipping
 * RULE lives in Woo's shipping zones and is applied at checkout (M3). This is a nudge, not a calc, so
 * it must match the store's real free-shipping minimum to stay honest.
 *  - a number (MAJOR units, e.g. 75 = £75 inc-VAT subtotal): show the bar + remaining amount.
 *  - null: no free-shipping threshold → no bar (the default for stores without one).
 * Shown on BOTH cart surfaces (mini-cart drawer + /cart). Default 75 for this POC shoe store.
 */
export const FREE_SHIPPING_THRESHOLD: number | null = 60;

/**
 * CHECKOUT (M3 — the money path, ADR 0017). When true, the cart's "Checkout" CTA links to the
 * `/checkout` flow; when false it shows the disabled "(M3)" placeholder. The POC gateway is **Cheque**
 * (offline — no card data, no PCI, no Stripe): it places an `on-hold` order with no payment processing.
 * ⚠ For the LIVE site, the deployed Woo (Atlas) must have the gateway(s) below ENABLED + a shipping zone
 * configured, or checkout fails — sync the live store BEFORE enabling this in production (docs/commerce.md
 * go-live). Production Stripe is a separate, later M3.
 *
 * ENV-DRIVEN (prod-safe): off unless `NEXT_PUBLIC_CHECKOUT_ENABLED=true`. So merging the checkout code
 * ships it DARK on prod (cart shows the "(M3)" placeholder, `/checkout` → `/cart`) until BOTH the live
 * Woo is configured AND the env var is set. Local dev sets it inline (see scripts / dev command).
 */
export const CHECKOUT_ENABLED = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";

/**
 * Customer account area gate (mirrors CHECKOUT_ENABLED). The /account area + the header "Account /
 * Sign in" affordance need the **wp-graphql-jwt-authentication** plugin on the live WP (go-live gate,
 * docs/auth.md). ENV-DRIVEN (prod-safe): off unless `NEXT_PUBLIC_ACCOUNT_ENABLED=true`, so merging the
 * account code ships it DARK on prod (no account header entry; `/account/*` → `/`) until BOTH the Atlas
 * JWT plugin is installed AND the env var is set. Local dev sets it inline.
 */
export const ACCOUNT_ENABLED = process.env.NEXT_PUBLIC_ACCOUNT_ENABLED === "true";

/** Payment methods offered at checkout — Store API gateway `id` + display copy. POC: cheque only. */
export const PAYMENT_METHODS: { id: string; label: string; description: string }[] = [
  {
    id: "cheque",
    label: "Cheque (test — no payment taken)",
    description: "Places an on-hold order for review. No real payment is processed (proof-of-concept gateway).",
  },
];

/** Currency affixes from Woo's totals — shared by the cart adapter + the free-shipping nudge. */
export type CartCurrency = { prefix: string; suffix: string; minorUnit: number };

/** Format an integer minor-unit amount with the currency affixes. Pure (client-safe). */
export function formatMoney(minor: number, c: CartCurrency): string {
  const value = (minor / 10 ** c.minorUnit).toFixed(c.minorUnit);
  return `${c.prefix}${value}${c.suffix}`;
}

/**
 * Free-shipping nudge state for a given subtotal, or null when no threshold is configured.
 * `remainingMinor` = how much more (minor units) to qualify; `qualified` once met; `pct` 0–100.
 * Pure + client-safe (used by the server /cart page AND the client mini-cart drawer).
 */
export function freeShippingProgress(
  subtotalMinor: number,
  minorUnit: number,
): { remainingMinor: number; qualified: boolean; pct: number } | null {
  if (FREE_SHIPPING_THRESHOLD == null || subtotalMinor <= 0) return null;
  const thresholdMinor = FREE_SHIPPING_THRESHOLD * 10 ** minorUnit;
  const remainingMinor = Math.max(0, thresholdMinor - subtotalMinor);
  return {
    remainingMinor,
    qualified: remainingMinor === 0,
    pct: Math.min(100, Math.round((subtotalMinor / thresholdMinor) * 100)),
  };
}
