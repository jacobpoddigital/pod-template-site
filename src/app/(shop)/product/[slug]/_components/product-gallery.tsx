"use client";

import * as React from "react";
import { Footprints, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/ui/carousel";
import type { ProductImage } from "@/lib/commerce/products";
import { useColourGallery } from "@/app/(shop)/_components/colour-gallery";

// PDP gallery on the shared embla Carousel: drag + touch-swipe + chevrons + keyboard, a DRAGGABLE
// synced thumbnail strip (so overflow thumbs are reachable), and a full lightbox harmonised with
// the cart/filter drawers (bordered panel, header with border-b). Square tiles + object-contain so
// the rectangular shoe is never cropped. Image-optional → branded icon placeholder.

const TILE = "aspect-square overflow-hidden rounded-lg bg-surface-muted";
const IMG = "h-full w-full object-contain";

function ThumbStrip({
  images,
  selected,
  onSelect,
}: {
  images: ProductImage[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <Carousel opts={{ dragFree: true, containScroll: "trimSnaps", align: "start" }} aria-label="Product thumbnails">
      <CarouselContent className="-ml-2">
        {images.map((img, i) => (
          <CarouselItem key={img.url} className="basis-auto pl-2">
            <button
              type="button"
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-pressed={i === selected}
              onClick={() => onSelect(i)}
              className={cn(
                "size-20 overflow-hidden rounded-md border-2 bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                i === selected ? "border-primary" : "border-border hover:border-foreground/40",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-contain" draggable={false} />
            </button>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

function Lightbox({
  images,
  startIndex,
  name,
  onClose,
}: {
  images: ProductImage[];
  startIndex: number | null;
  name: string;
  onClose: () => void;
}) {
  const [api, setApi] = React.useState<CarouselApi>();
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") api?.scrollPrev();
    if (e.key === "ArrowRight") api?.scrollNext();
  };

  return (
    <Dialog open={startIndex !== null} onOpenChange={(o) => !o && onClose()}>
      {/* Full-screen on mobile + centred modal on desktop = the DialogContent default (agency modal
          standard); here we only set the desktop max width + the flush gallery layout. */}
      <DialogContent
        onKeyDown={onKeyDown}
        className="max-w-5xl gap-0 overflow-hidden p-0"
      >
        {/* 60px tall so the primitive's 40px close (top-2.5) is vertically centred (equal gaps). */}
        <div className="flex h-[60px] items-center border-b border-border px-6">
          <DialogTitle className="display-xs text-foreground">{name}</DialogTitle>
        </div>
        {startIndex !== null && (
          <Carousel setApi={setApi} opts={{ startIndex, loop: images.length > 1 }} className="p-4 max-sm:p-0">
            <CarouselContent>
              {images.map((img) => (
                <CarouselItem key={img.url}>
                  <div className="flex h-[76vh] items-center justify-center max-sm:h-[calc(100dvh-3.75rem)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt} className="max-h-full max-w-full object-contain" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);
  const [lightbox, setLightbox] = React.useState<number | null>(null);
  const { selectedColour, colourImages } = useColourGallery();

  // When a colourway image exists for the chosen colour, surface it FIRST (de-duped) and scroll
  // the carousel to it — selecting a colour visibly swaps the shoe. No colourway image → unchanged.
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

  // Snap back to the (new) primary image whenever the selected colourway changes.
  React.useEffect(() => {
    if (colourImg) api?.scrollTo(0);
  }, [colourImg, api]);

  if (display.length === 0) {
    return (
      <div className={cn(TILE, "flex items-center justify-center bg-surface-raised")}>
        <Footprints className="size-24 text-muted-foreground/40" aria-hidden="true" />
      </div>
    );
  }

  const multi = display.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <Carousel setApi={setApi} opts={{ loop: multi }} className="group">
        <CarouselContent>
          {display.map((img, i) => (
            <CarouselItem key={img.url}>
              <button
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={`Zoom in on ${name} — image ${i + 1} of ${display.length}`}
                className={cn(TILE, "relative block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className={IMG} draggable={false} />
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-border bg-surface/95 px-2.5 py-1 body-sm text-foreground backdrop-blur"
                >
                  <ZoomIn className="size-3.5" /> Zoom
                </span>
              </button>
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

      {multi && <ThumbStrip images={display} selected={selected} onSelect={(i) => api?.scrollTo(i)} />}

      <Lightbox images={display} startIndex={lightbox} name={name} onClose={() => setLightbox(null)} />
    </div>
  );
}
