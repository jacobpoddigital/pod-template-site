import { cn } from "@/lib/utils";
import { Badge } from "@/ui/badge";
import { PRICE_DISPLAY, STOCK_DISPLAY } from "@/lib/commerce/config";
import { saleMeta, stockLabel, isPriceRange, lowestFormatted, type SaleMeta, type StockState, type BackorderMode } from "@/lib/commerce/pricing";

// "From {low}" collapses a variable product's min–max range to its low end (PRICE_DISPLAY flag); only
// engages when the price is actually a range, so simple (single-price) products are untouched.
function collapsedPrice(m: SaleMeta): { collapse: boolean; active: string | null; regular: string | null } {
  const collapse = PRICE_DISPLAY === "from" && (isPriceRange(m.active) || isPriceRange(m.regular));
  return {
    collapse,
    active: collapse ? lowestFormatted(m.active) : m.active,
    regular: collapse ? lowestFormatted(m.regular) : m.regular,
  };
}

// Shared commerce display primitives (server- AND client-safe — pure, no `server-only`). Used by
// the listing card, the PDP buy-box, and the quick-view so sale/stock presentation is identical
// everywhere (one rung per role: price = display-xs/sm; struck "was" = body-sm muted line-through).

type PriceInput = {
  price: string | null;
  regularPrice: string | null;
  salePrice: string | null;
  onSale: boolean;
};

/** Was/now price with an inline %-off. `size` picks the price type rung (card = md, PDP = lg). */
export function Price({
  product,
  size = "md",
  className,
}: {
  product: PriceInput;
  size?: "md" | "lg";
  className?: string;
}) {
  const m = saleMeta(product);
  const rung = size === "lg" ? "display-sm" : "display-xs";
  const { collapse, active, regular } = collapsedPrice(m);
  const from = collapse ? <span className="body-sm font-normal text-muted-foreground">From</span> : null;
  if (!m.onSale || !m.regular) {
    if (!product.price) return null;
    const fallback = m.active ?? product.price;
    const shown = collapse ? lowestFormatted(fallback) : fallback;
    return (
      <p className={cn(rung, "text-foreground", className)}>
        {from} {shown}
      </p>
    );
  }
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      {from}
      <span className={cn(rung, "text-foreground")}>{active}</span>
      <span className="body-sm text-muted-foreground line-through">{regular}</span>
      {m.percentOff != null && <span className="body-sm font-semibold text-warning">−{m.percentOff}%</span>}
    </p>
  );
}

/** Stock nudge — "Only N left" / "Available on backorder" / "Out of stock". Null when plainly in
 *  stock (incl. a SILENT `YES` backorder, which reads as in stock). Honours Woo's per-product
 *  low-stock `threshold` + the `STOCK_DISPLAY` policy. Low-stock + backorder use warning; OOS muted. */
export function StockNote({
  state,
  qty,
  backorder = "NOTIFY",
  threshold,
  className,
}: {
  state: StockState;
  qty: number | null;
  backorder?: BackorderMode;
  threshold?: number;
  className?: string;
}) {
  const label = stockLabel(state, qty, { backorder, threshold, display: STOCK_DISPLAY });
  if (!label) return null;
  const tone = state === "OUT_OF_STOCK" ? "text-muted-foreground" : "text-warning";
  return (
    <p className={cn("body-sm font-medium", tone, className)} aria-live="polite">
      {label}
    </p>
  );
}

/** Small image-overlay status badge set (Sale %-off, Out of stock, Backorder) for the card. A
 *  silent (`YES`) backorder reads as in stock → no badge. */
export function StatusBadges({
  product,
  backorder = "NOTIFY",
  featured = false,
  downloadable = false,
  className,
}: {
  product: PriceInput & { stockStatus: StockState };
  backorder?: BackorderMode;
  featured?: boolean;
  downloadable?: boolean;
  className?: string;
}) {
  const m = saleMeta(product);
  return (
    <div className={cn("pointer-events-none flex flex-col items-start gap-1", className)}>
      {featured && <Badge variant="default">Featured</Badge>}
      {downloadable && <Badge variant="muted">Digital download</Badge>}
      {m.onSale && (
        <Badge variant="warning">{m.percentOff != null ? `Save ${m.percentOff}%` : "Sale"}</Badge>
      )}
      {product.stockStatus === "ON_BACKORDER" && backorder !== "YES" && <Badge variant="muted">Backorder</Badge>}
    </div>
  );
}
