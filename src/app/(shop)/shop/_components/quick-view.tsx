"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Footprints, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/ui/carousel";
import { VariationSelector } from "@/app/(shop)/product/[slug]/_components/variation-selector";
import { ExternalBuy } from "@/app/(shop)/product/[slug]/_components/external-buy";
import { GroupedBuy } from "@/app/(shop)/product/[slug]/_components/grouped-buy";
import { ProductTags } from "@/app/(shop)/product/[slug]/_components/product-tags";
import { Price, StockNote } from "@/app/(shop)/_components/price";
import { ColourGalleryProvider, useColourGallery } from "@/app/(shop)/_components/colour-gallery";
import { lowStockThreshold, saleEndsLabel } from "@/lib/commerce/pricing";
import { taxSuffix } from "@/lib/commerce/config";
import type { ProductDetail, ProductImage } from "@/lib/commerce/products";

// Listing QUICK-VIEW (card-UX standard): assess + pick fit without a full PDP load. Aligned with
// the house overlay family — the gallery lightbox + cart + filter drawers: a Dialog that goes
// FULL-SCREEN on mobile (max-sm: overrides), a 60px bordered header, and the SAME embla Carousel
// the PDP gallery uses (drag/swipe + chevrons). The card only carries `ProductCard`, so we fetch
// the full `ProductDetail` on open (/api/product/[slug]). Fit is chosen in the SAME
// VariationSelector the PDP uses — selection is required before "Add to bag", so this honours the
// no-blind-add stance. Available on desktop (hover/focus-revealed trigger) AND mobile (always-shown
// pill, like the gallery "Zoom" pill).

function glanceSpecs(p: ProductDetail): { label: string; value: string }[] {
  return [
    p.drop && { label: "Drop", value: p.drop },
    p.weightGrams && { label: "Weight", value: `${p.weightGrams}g` },
    p.cushioning && { label: "Cushioning", value: p.cushioning },
    p.pronation && { label: "Support", value: p.pronation },
  ].filter(Boolean) as { label: string; value: string }[];
}

// Swipeable gallery on the shared embla Carousel (same behaviour as the PDP gallery), with a
// thumbnail row synced to the active slide. No nested lightbox — "View full details" → PDP owns
// full zoom. Square tiles + object-contain so the shoe is never cropped; icon placeholder if empty.
function QuickViewGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);
  const { selectedColour, colourImages } = useColourGallery();

  // Mirror the PDP gallery: a chosen colourway image is surfaced first + scrolled to (no-op when
  // the product has no colourway images).
  const colourImg = selectedColour ? colourImages[selectedColour.trim().toLowerCase()] : undefined;
  const display = React.useMemo(
    () => (colourImg ? [colourImg, ...images.filter((i) => i.url !== colourImg.url)] : images),
    [colourImg, images],
  );

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (colourImg) api?.scrollTo(0);
  }, [colourImg, api]);

  if (display.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-surface-raised">
        <Footprints className="size-16 text-muted-foreground/40" aria-hidden="true" />
      </div>
    );
  }

  const multi = display.length > 1;
  return (
    <div className="flex flex-col gap-3">
      <Carousel setApi={setApi} opts={{ loop: multi }} className="group" aria-label={`${name} images`}>
        <CarouselContent>
          {display.map((img) => (
            <CarouselItem key={img.url}>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt || name} className="h-full w-full object-contain" draggable={false} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {multi && (
          <>
            <CarouselPrevious className="opacity-0 group-hover:opacity-100" />
            <CarouselNext className="opacity-0 group-hover:opacity-100" />
          </>
        )}
      </Carousel>
      {multi && (
        <ul className="flex gap-2">
          {display.slice(0, 5).map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                aria-label={`View image ${i + 1}`}
                aria-pressed={i === selected}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "flex size-14 items-center justify-center overflow-hidden rounded-md border-2 bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  i === selected ? "border-primary" : "border-border hover:border-foreground/40",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-contain" draggable={false} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Price + sale-end urgency + stock + SKU — mirrors the PDP buy-box `PriceBlock` so the same item-7
// signals surface in the quick-look mini-PDP (featured/reviews handled inline in QuickViewDetail).
function QuickViewPricing({ detail }: { detail: ProductDetail }) {
  const saleEnds = detail.onSale ? saleEndsLabel(detail.saleEndsAt) : null;
  const tax = taxSuffix();
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <Price product={detail} />
        {tax && <span className="body-sm text-muted-foreground">{tax}</span>}
      </div>
      {saleEnds && (
        <p className="inline-flex items-center gap-1.5 body-sm font-medium text-warning">
          <Clock className="size-4" aria-hidden="true" />
          {saleEnds}
        </p>
      )}
      <StockNote
        state={detail.stockStatus}
        qty={detail.stockQuantity}
        backorder={detail.backorders}
        threshold={lowStockThreshold(detail.lowStockAmount)}
      />
      {detail.sku && (
        <p className="body-sm text-muted-foreground">
          SKU: <span className="font-medium text-foreground">{detail.sku}</span>
        </p>
      )}
    </div>
  );
}

// Quick-view badge row — featured / digital (downloadable) / category / support. Extracted so
// QuickViewDetail stays under the complexity ceiling.
function QuickViewBadges({ detail }: { detail: ProductDetail }) {
  const category = detail.categories[0];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {detail.featured && <Badge variant="default">Featured</Badge>}
      {detail.downloadable && <Badge variant="outline">Digital download</Badge>}
      {detail.virtual && !detail.downloadable && <Badge variant="outline">Digital</Badge>}
      {category && <Badge variant="default">{category.name}</Badge>}
      {detail.pronation && <Badge variant="outline">{detail.pronation}</Badge>}
    </div>
  );
}

function QuickViewDetail({ detail, slug }: { detail: ProductDetail; slug: string }) {
  const images = [detail.image, ...detail.gallery].filter((i): i is ProductImage => Boolean(i));
  const specs = glanceSpecs(detail);
  const showRating = detail.reviewsAllowed && typeof detail.averageRating === "number" && Boolean(detail.reviewCount);

  return (
    <ColourGalleryProvider colourImages={detail.colourImages}>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <QuickViewGallery images={images} name={detail.name} />

      <div className="flex flex-col">
        <QuickViewBadges detail={detail} />

        {showRating && (
          <span className="mt-3 inline-flex items-center gap-1.5 body-sm text-muted-foreground">
            <Star className="size-4 fill-current text-warning" aria-hidden="true" />
            {detail.averageRating!.toFixed(1)} · {detail.reviewCount} reviews
          </span>
        )}

        <QuickViewPricing detail={detail} />

        {specs.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 body-sm">
            {specs.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-2">
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd className="font-medium text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Buy control switches on product kind — same paths as the PDP buy-box: external → outbound
            button, grouped → child add-to-cart list, simple/variable → size/colour selector. */}
        {detail.kind === "external" ? (
          <ExternalBuy product={detail} className="mt-5" />
        ) : detail.kind === "grouped" ? (
          <GroupedBuy products={detail.groupedProducts} />
        ) : (
          <div className="mt-5">
            <VariationSelector
              productId={detail.id}
              options={detail.options}
              variations={detail.variations}
              defaultAttributes={detail.defaultAttributes}
              stockStatus={detail.stockStatus}
              stockQuantity={detail.stockQuantity}
              soldIndividually={detail.soldIndividually}
              backorders={detail.backorders}
            />
          </div>
        )}

        <ProductTags tags={detail.tags} />

        <Link
          href={`/product/${slug}`}
          className="mt-5 inline-flex items-center self-start body-sm font-medium text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View full details
        </Link>
      </div>
    </div>
    </ColourGalleryProvider>
  );
}

function QuickViewBody({ slug }: { slug: string }) {
  // The body mounts fresh each open (rendered behind `{open && …}`), so `slug` is stable for its
  // lifetime — one fetch, no synchronous loading-reset needed (initial state is already "loading").
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [detail, setDetail] = React.useState<ProductDetail | null>(null);

  React.useEffect(() => {
    let live = true;
    fetch(`/api/product/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: ProductDetail) => {
        if (!live) return;
        setDetail(d);
        setStatus("ready");
      })
      .catch(() => live && setStatus("error"));
    return () => {
      live = false;
    };
  }, [slug]);

  if (status === "ready" && detail) return <QuickViewDetail detail={detail} slug={slug} />;

  if (status === "error") {
    return (
      <p className="body-sm text-muted-foreground">
        Couldn&apos;t load a quick view.{" "}
        <Link href={`/product/${slug}`} className="text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          View full details
        </Link>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-2 h-11 w-40" />
      </div>
    </div>
  );
}

export function QuickView({ slug, name, triggerClassName }: { slug: string; name: string; triggerClassName?: string }) {
  const [open, setOpen] = React.useState(false);

  // Close the quick-view when an item is added, so the mini-cart drawer (opened by VariationSelector's
  // cart:open event) isn't stacked behind the modal. Only listens while open.
  React.useEffect(() => {
    if (!open) return;
    const onChanged = () => setOpen(false);
    window.addEventListener("cart:changed", onChanged);
    return () => window.removeEventListener("cart:changed", onChanged);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/95 px-3 py-2 body-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          triggerClassName,
        )}
      >
        <Eye className="size-4" aria-hidden="true" />
        Quick look
      </DialogTrigger>
      {/* Full-screen on mobile + centred modal on desktop comes from the DialogContent default
          (agency modal standard); here we only set the desktop width + the scrollable column. The
          bordered header carries the title; `pr-16` reserves the top-right space for the primitive's
          40px close button (a long product name would otherwise run under it), and `line-clamp-2`
          keeps even a very long name to two tidy lines. `min-h` (not fixed `h`) lets it grow. */}
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <div className="flex min-h-[60px] shrink-0 items-center border-b border-border py-3 pl-6 pr-16">
          <DialogTitle className="display-xs text-foreground line-clamp-2">{name}</DialogTitle>
        </div>
        {/* Extra bottom padding for the iOS home indicator / hidden toolbar so the last control
            (Add to bag) is never obscured (safe-area inset, mobile only). */}
        <div className="flex-1 overflow-y-auto p-6 max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {open && <QuickViewBody slug={slug} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
