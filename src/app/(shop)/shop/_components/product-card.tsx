import Link from "next/link";
import { Footprints } from "lucide-react";
import { Badge } from "@/ui/badge";
import { ButtonLink } from "@/ui/button-link";
import { Price, StockNote, StatusBadges } from "@/app/(shop)/_components/price";
import { Stars } from "./stars";
import { QuickView } from "./quick-view";
import type { ProductCard as ProductCardData } from "@/lib/commerce/products";

// Listing card (approved wireframe S4): spec chips (type · support · cushioning) + two key
// specs (drop + weight) + star rating, CTA "View & Select Size" → PDP (deliberately NOT
// add-to-cart; size/width fit is chosen on the PDP, which protects against returns anxiety).
// Image-optional: a branded placeholder (icon-library glyph, never a unicode char — house rule).
// The card isn't a single wrapping link (a real CTA button can't nest in one) — the image and
// title link to the PDP, and the CTA is its own button.

function CardMedia({ product, href }: { product: ProductCardData; href: string }) {
  return (
    <Link
      href={href}
      aria-label={product.name}
      className="relative flex aspect-square items-center justify-center border-b border-border bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image.url} alt={product.image.alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <Footprints className="size-16 text-muted-foreground/40" aria-hidden="true" />
      )}
      <StatusBadges product={product} backorder={product.backorders} featured={product.featured} downloadable={product.downloadable} className="absolute left-3 top-3" />
      {!product.inStock && <Badge variant="muted" className="absolute right-3 top-3">Out of stock</Badge>}
    </Link>
  );
}

function CardChips({ product }: { product: ProductCardData }) {
  const type = product.categories[0]?.name; // Daily Trainers / Stability / Racing / Trail
  const chips = [
    type && { key: "t", label: type, variant: "default" as const },
    product.pronation && { key: "p", label: product.pronation, variant: "outline" as const },
    product.cushioning && { key: "c", label: `${product.cushioning} cushion`, variant: "muted" as const },
  ].filter(Boolean) as { key: string; label: string; variant: "default" | "outline" | "muted" }[];
  if (!chips.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <li key={c.key}>
          <Badge variant={c.variant}>{c.label}</Badge>
        </li>
      ))}
    </ul>
  );
}

function CardSpecs({ product }: { product: ProductCardData }) {
  const specs = [
    product.drop && { key: "drop", label: "Drop", value: product.drop },
    product.weightGrams && { key: "weight", label: "Weight", value: `${product.weightGrams}g` },
  ].filter(Boolean) as { key: string; label: string; value: string }[];
  if (!specs.length) return null;
  return (
    <dl className="flex flex-wrap gap-x-4 gap-y-0.5 body-sm text-muted-foreground">
      {specs.map((s) => (
        <div key={s.key} className="flex gap-1.5">
          <dt>{s.label}</dt>
          <dd className="font-medium text-foreground">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const href = `/product/${product.slug}`;
  // Suppress the card star rating when the merchant has disabled reviews (consistent with the PDP +
  // quick-view, which hide the reviews section / rating link).
  const showRating = product.reviewsAllowed && product.rating != null && product.rating > 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface-raised transition-colors motion-safe:hover:border-foreground/30">
      <div className="relative">
        <CardMedia product={product} href={href} />
        {/* Quick-view trigger overlaid on the image (like the gallery "Zoom" pill): always visible +
            tappable on touch; on desktop it's hidden until the card is hovered/focused (pointer-events
            gated so it never blocks the image link while invisible). The modal switches its buy control
            on product kind (selector / outbound button / grouped child list), so all kinds get one. */}
        <QuickView
          slug={product.slug}
          name={product.name}
          triggerClassName="absolute bottom-3 left-1/2 -translate-x-1/2 lg:pointer-events-none lg:opacity-0 lg:transition-opacity lg:group-hover:pointer-events-auto lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:opacity-100 motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <CardChips product={product} />
        <h3 className="display-xs text-foreground">
          <Link
            href={href}
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:text-link"
          >
            {product.name}
          </Link>
        </h3>
        <CardSpecs product={product} />
        {showRating && <Stars rating={product.rating as number} reviewCount={product.reviewCount} />}
        <div className="mt-auto pt-3">
          {/* Price = the display-xs price rung (typography order); was/now + %off when on sale. */}
          <Price product={product} />
          <StockNote state={product.stockStatus} qty={product.stockQuantity} backorder={product.backorders} className="mt-1" />
          <ButtonLink href={href} size="md" className="mt-3 w-full justify-center">
            {product.isVariable && product.inStock ? "View & Select Size" : "View details"}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
