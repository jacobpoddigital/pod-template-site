// Pure pricing + stock helpers — NO `server-only` so client components (variation-selector,
// quick-view) and server components (card, buy-box) can both import. Commerce must handle the
// full WooCommerce surface, not one happy path: sale (was/now + %off), and every stock state.

export const LOW_STOCK_THRESHOLD = 5; // fallback when Woo's per-product `low_stock_amount` is unset

export type StockState = "IN_STOCK" | "OUT_OF_STOCK" | "ON_BACKORDER";

// Woo backorder POLICY (the `backorders` field), distinct from the current ON_BACKORDER state:
//   NO     — backorders not allowed (sells out → OUT_OF_STOCK)
//   NOTIFY — allowed, customer warned ("Available on backorder")
//   YES    — allowed silently (a backordered item should read as in stock — no warning)
export type BackorderMode = "NO" | "NOTIFY" | "YES";

/** Coerce a WooGraphQL BackordersEnum (or null) to our closed set; unknown → NO. */
export function backorderMode(s: string | null | undefined): BackorderMode {
  return s === "NOTIFY" || s === "YES" ? s : "NO";
}

/** Coerce a WooGraphQL StockStatusEnum (or null) to our closed set; unknown → in stock. */
export function stockState(s: string | null | undefined): StockState {
  return s === "OUT_OF_STOCK" || s === "ON_BACKORDER" ? s : "IN_STOCK";
}

/** Effective low-stock threshold — Woo's per-product `low_stock_amount`, else the agency default. */
export function lowStockThreshold(amount: number | null | undefined): number {
  return amount != null && amount > 0 ? amount : LOW_STOCK_THRESHOLD;
}

/** True when a buyable item is running low (in stock, known qty, at/below the threshold). */
export function isLowStock(
  state: StockState,
  qty: number | null | undefined,
  threshold: number = LOW_STOCK_THRESHOLD,
): boolean {
  return state === "IN_STOCK" && qty != null && qty > 0 && qty <= threshold;
}

// Woo joins a variable product's min/max price with a hyphen/en-dash/em-dash (FORMATTED).
const RANGE_SEP = /\s*[–—-]\s*/;

/** True when a formatted price is a min–max range (a variable product spanning prices). */
export function isPriceRange(s: string | null | undefined): boolean {
  return !!s && RANGE_SEP.test(s.trim());
}

/** Low end of a formatted price range ("£169 – £174" → "£169"); pass-through if not a range. */
export function lowestFormatted(s: string | null | undefined): string | null {
  if (!s) return null;
  return s.split(RANGE_SEP)[0]?.trim() || s;
}

// First numeric value in a formatted price (handles ranges like "£230.00 - £235.00" → 230).
function firstNum(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.replace(/,/g, "").match(/[\d.]+/);
  const n = m ? parseFloat(m[0]) : NaN;
  return Number.isFinite(n) ? n : null;
}

/** Tasteful sale-end urgency: Woo's `dateOnSaleTo` → "Sale ends 24 Jun". Returns null when there's
 *  no scheduled end, the date is unparseable, or the end has already passed (Woo would have cleared
 *  `onSale` by then, but we guard anyway). Date-only — no countdown clock (avoids hydration churn). */
export function saleEndsLabel(dateOnSaleTo: string | null | undefined): string | null {
  if (!dateOnSaleTo) return null;
  // Woo returns either an ISO string with offset ("2026-07-01T14:33:48+00:00") or a space form
  // ("2026-06-30 23:59:59", stored as UTC). Normalise the space form to explicit-UTC ISO so parsing
  // and the displayed day don't depend on the server timezone (format in UTC for the same reason).
  const raw = dateOnSaleTo.includes("T") ? dateOnSaleTo : `${dateOnSaleTo.replace(" ", "T")}Z`;
  const end = new Date(raw);
  if (Number.isNaN(end.getTime()) || end.getTime() <= Date.now()) return null;
  return `Sale ends ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}`;
}

export type SaleMeta = {
  onSale: boolean;
  /** Struck-through "was" price (regular). Null when not on sale. */
  regular: string | null;
  /** Active "now" price (sale). */
  active: string | null;
  /** Whole-number % off, or null if not computable. */
  percentOff: number | null;
};

/** Resolve sale display from the raw Woo fields. `active` is the price to show prominently;
 *  `regular` is the struck-through original. For variable products these may be ranges. */
export function saleMeta(args: {
  onSale: boolean | null | undefined;
  price: string | null | undefined;
  regularPrice: string | null | undefined;
  salePrice: string | null | undefined;
}): SaleMeta {
  const active = args.salePrice ?? args.price ?? null;
  if (!args.onSale || !args.regularPrice) {
    return { onSale: false, regular: null, active: args.price ?? null, percentOff: null };
  }
  const r = firstNum(args.regularPrice);
  const s = firstNum(active);
  const percentOff = r != null && s != null && r > s ? Math.round(((r - s) / r) * 100) : null;
  return { onSale: true, regular: args.regularPrice, active, percentOff };
}

/** Short human label for a stock state (PDP/card). Honours the backorder POLICY (a silent `YES`
 *  backorder reads as in stock) and a per-product low-stock threshold + a stock-display policy:
 *   - "count" — "Only N left" (exact remaining)
 *   - "badge" — generic "Low stock" (no number)
 *   - "none"  — never surface a low-stock nudge
 *  `qty`/`threshold` drive the low-stock nudge; pass Woo's `low_stock_amount` as `threshold`. */
type StockDisplay = "count" | "badge" | "none";

const lowStockText = (qty: number | null | undefined, display: StockDisplay): string | null =>
  display === "none" ? null : display === "badge" ? "Low stock" : `Only ${qty} left`;

export function stockLabel(
  state: StockState,
  qty: number | null | undefined,
  opts: { threshold?: number; backorder?: BackorderMode; display?: StockDisplay } = {},
): string | null {
  const { threshold = LOW_STOCK_THRESHOLD, backorder = "NOTIFY", display = "count" } = opts;
  if (state === "OUT_OF_STOCK") return "Out of stock";
  if (state === "ON_BACKORDER") return backorder === "YES" ? null : "Available on backorder";
  // Scarcity nudge only when backorders are NOT allowed — if the item can be reordered past its
  // stock (NOTIFY or YES), "Only N left" is misleading (and qty can read 0 on a silent backorder).
  return backorder === "NO" && isLowStock(state, qty, threshold) ? lowStockText(qty, display) : null;
}
