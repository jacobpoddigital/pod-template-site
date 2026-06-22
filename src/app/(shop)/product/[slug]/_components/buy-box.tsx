import Link from "next/link";
import { Star, Check, Truck, Clock, Download, Zap } from "lucide-react";
import { Badge } from "@/ui/badge";
import { RichText } from "@/ui/rich-text";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/ui/accordion";
import type { ProductDetail } from "@/lib/commerce/products";
import { lowStockThreshold, saleEndsLabel } from "@/lib/commerce/pricing";
import { taxSuffix } from "@/lib/commerce/config";
import { Price, StockNote } from "@/app/(shop)/_components/price";
import { VariationSelector } from "./variation-selector";
import { GroupedBuy } from "./grouped-buy";
import { ExternalBuy } from "./external-buy";
import { ProductTags } from "./product-tags";

const MICRO_TRUST = [
  "Free UK delivery on orders over £60",
  "Free size exchanges — we cover return postage",
  "30-day returns",
  "Secure checkout — 256-bit SSL",
];

// Estimated delivery date — next-day-ish dispatch + a short window, skipping weekends. A real
// store would read the courier SLA; this is an honest "typical" estimate for the POC.
function deliveryEstimate(): string {
  const d = new Date();
  let added = 0;
  while (added < 3) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

type Chip = { key: string; label: string; variant: "default" | "outline" | "muted" };

function buildChips(product: ProductDetail): Chip[] {
  const category = product.categories[0];
  return [
    product.featured && { key: "f", label: "Featured", variant: "default" as const },
    category && { key: "t", label: category.name, variant: "default" as const },
    product.pronation && { key: "p", label: product.pronation, variant: "outline" as const },
    product.brand && { key: "b", label: product.brand, variant: "muted" as const },
  ].filter(Boolean) as Chip[];
}

function buildGlanceSpecs(product: ProductDetail): { label: string; value: string }[] {
  return [
    product.drop && { label: "Heel drop", value: product.drop },
    product.weightGrams && { label: "Weight", value: `${product.weightGrams}g` },
    product.cushioning && { label: "Cushioning", value: product.cushioning },
    product.pronation && { label: "Support", value: product.pronation },
  ].filter(Boolean) as { label: string; value: string }[];
}

// Price + sale-end urgency + stock nudge + SKU. Extracted from BuyBox to keep its complexity in
// budget; pure presentation off the ProductDetail.
function PriceBlock({ product }: { product: ProductDetail }) {
  // Sale-end urgency ("Sale ends 24 Jun") — only when on sale AND Woo has a scheduled, still-future
  // end date (saleEndsLabel guards past/unparseable dates).
  const saleEnds = product.onSale ? saleEndsLabel(product.saleEndsAt) : null;
  const tax = taxSuffix();
  return (
    <div className="mt-4 flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <Price product={product} size="lg" />
        {tax && <span className="body-sm text-muted-foreground">{tax}</span>}
      </div>
      {saleEnds && (
        <p className="inline-flex items-center gap-1.5 body-sm font-medium text-warning">
          <Clock className="size-4" aria-hidden="true" />
          {saleEnds}
        </p>
      )}
      <StockNote
        state={product.stockStatus}
        qty={product.stockQuantity}
        backorder={product.backorders}
        threshold={lowStockThreshold(product.lowStockAmount)}
      />
      {product.sku && (
        <p className="body-sm text-muted-foreground">
          SKU: <span className="font-medium text-foreground">{product.sku}</span>
        </p>
      )}
    </div>
  );
}

// Rating summary link / "no reviews yet" prompt. Suppressed entirely when the product disables
// reviews (reviewsAllowed=false) — no link to a hidden section, no prompt to write one.
function RatingLink({ product }: { product: ProductDetail }) {
  if (!product.reviewsAllowed) return null;
  const showRating = typeof product.averageRating === "number" && Boolean(product.reviewCount);
  if (!showRating) {
    return <p className="mt-3 body-sm text-muted-foreground">No reviews yet — be the first to review this product.</p>;
  }
  return (
    <a
      href="#reviews"
      className="mt-3 inline-flex items-center gap-1.5 body-sm text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Star className="size-4 fill-current text-warning" aria-hidden="true" />
      {product.averageRating!.toFixed(1)} from {product.reviewCount} runner reviews
    </a>
  );
}

// Virtual products don't ship; downloadable ones deliver a file immediately. Replaces the
// physical delivery/returns copy with honest digital-fulfilment messaging (fulfilment itself is
// post-checkout / M3 — this is the storefront promise).
function DigitalFulfilment({ downloadable }: { downloadable: boolean }) {
  return (
    <div className="mt-6 rounded-lg border border-border bg-surface-raised p-4">
      <p className="flex items-center gap-2 body-sm font-medium text-foreground">
        {downloadable ? <Download className="size-4 text-success" aria-hidden="true" /> : <Zap className="size-4 text-success" aria-hidden="true" />}
        {downloadable ? "Instant digital download" : "Digital product — nothing ships"}
      </p>
      <p className="mt-1 body-sm text-muted-foreground">
        {downloadable
          ? "Your download is available immediately after purchase — no delivery, no waiting."
          : "Delivered digitally — there's nothing to ship, so no delivery or returns apply."}
      </p>
    </div>
  );
}

export function BuyBox({ product }: { product: ProductDetail }) {
  const chips = buildChips(product);
  const glanceSpecs = buildGlanceSpecs(product);
  const isDigital = product.virtual; // virtual = no physical shipment → swap the delivery copy

  return (
    <div id="buy-box">
      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <li key={c.key}>
              <Badge variant={c.variant}>{c.label}</Badge>
            </li>
          ))}
        </ul>
      )}

      <h1 className="mt-3 display-md text-foreground">{product.name}</h1>

      <RatingLink product={product} />

      <PriceBlock product={product} />

      {product.shortDescription && (
        <div className="mt-4 max-w-[65ch]">
          <RichText html={product.shortDescription} className="body text-muted-foreground" />
        </div>
      )}

      {glanceSpecs.length > 0 && (
        <div className="mt-6 rounded-lg border border-border bg-surface-raised p-4">
          <h2 className="display-xs text-foreground">Key specs at a glance</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
            {glanceSpecs.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-2 body-sm">
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd className="font-medium text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* External/Affiliate: outbound buy button, no cart and no store-fulfilment copy below. */}
      {product.kind === "external" ? (
        <ExternalBuy product={product} className="mt-6" />
      ) : (
        <>
          {/* Benefit line directly above the buy action — answers last-second doubt without a scroll.
              Shipping-specific, so it's omitted for virtual (digital) products. */}
          {!isDigital && (
            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 body-sm text-muted-foreground">
              <Check className="size-4 text-success" aria-hidden="true" />
              Free UK delivery over £60 · Free 30-day returns · Free size exchanges
            </p>
          )}

          {/* Grouped: a list of child products each added individually; otherwise the size/colour selector. */}
          {product.kind === "grouped" ? (
            <GroupedBuy products={product.groupedProducts} />
          ) : (
            <div className="mt-4">
              <VariationSelector
                productId={product.id}
                options={product.options}
                variations={product.variations}
                defaultAttributes={product.defaultAttributes}
                stockStatus={product.stockStatus}
                stockQuantity={product.stockQuantity}
                soldIndividually={product.soldIndividually}
                backorders={product.backorders}
                basePrice={product.price}
              />
            </div>
          )}

          {/* Digital (virtual) products: download/instant-access messaging in place of the physical
              delivery ETA, fit guide, and delivery/returns accordion below. */}
          {isDigital ? (
            <DigitalFulfilment downloadable={product.downloadable} />
          ) : (
            <>
          <p className="mt-4 inline-flex items-center gap-2 body-sm text-muted-foreground">
            <Truck className="size-4 text-foreground" aria-hidden="true" />
            Order by 2pm — estimated delivery <span className="font-medium text-foreground">{deliveryEstimate()}</span>
          </p>

          {/* Fit guidance is shoe-specific — omit for simple accessories (no drop/width/terrain). */}
          {glanceSpecs.length > 0 && (
            <p className="mt-4 body-sm text-muted-foreground">
              Not sure on fit?{" "}
              <Link href="/fit-guide" className="text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Read our fit guide
              </Link>{" "}
              — drop, width, and terrain explained.
            </p>
          )}

          {/* Returns/delivery detail — Baymard: 60% of users check the return policy on the PDP. */}
          <Accordion type="single" collapsible className="mt-4 border-t border-border">
            <AccordionItem value="delivery">
              <AccordionTrigger>Delivery &amp; returns</AccordionTrigger>
              <AccordionContent>
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {MICRO_TRUST.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-3">
                  See full{" "}
                  <Link href="/delivery" className="text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    delivery
                  </Link>{" "}
                  and{" "}
                  <Link href="/returns" className="text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    returns
                  </Link>{" "}
                  information.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
            </>
          )}
        </>
      )}

      <ProductTags tags={product.tags} />
    </div>
  );
}
