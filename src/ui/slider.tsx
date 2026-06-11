"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Carousel built on Embla (the engine shadcn's Carousel uses): drag/touch/momentum,
// keyboard, prev/next buttons with disabled states. Same API as before so blocks
// (card/services/reviews) render <Slider><SliderItem/></Slider> unchanged. Client
// component — server-rendered children are passed straight through.

const BTN =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-ink transition disabled:cursor-not-allowed disabled:opacity-40 motion-safe:hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function Slider({ children, label, className }: { children: React.ReactNode; label?: string; className?: string }) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!embla) return;
    const update = () => {
      setCanPrev(embla.canScrollPrev());
      setCanNext(embla.canScrollNext());
    };
    update();
    embla.on("select", update).on("reInit", update);
    return () => {
      embla.off("select", update).off("reInit", update);
    };
  }, [embla]);

  return (
    <div className={cn("relative", className)} role="region" aria-roledescription="carousel" aria-label={label ?? "Carousel"}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">{children}</div>
      </div>
      <div className="mt-6 flex gap-2">
        <button type="button" className={BTN} aria-label="Previous" disabled={!canPrev} onClick={() => embla?.scrollPrev()}>
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" className={BTN} aria-label="Next" disabled={!canNext} onClick={() => embla?.scrollNext()}>
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function SliderItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("min-w-0 shrink-0 basis-4/5 sm:basis-1/2 lg:basis-1/3", className)}>{children}</div>;
}
