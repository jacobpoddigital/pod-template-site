"use client";

import * as React from "react";
import { Star, RefreshCw, Truck, ShieldCheck, Download, Smartphone } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/ui/carousel";

// PDP trust strip. Mobile: an autoplay slider (one reassurance at a time — a 2×2 grid felt
// cramped). Desktop: the full inline row. Autoplay pauses for prefers-reduced-motion and is
// swipeable either way.
const TRUST = [
  { icon: Star, label: "4.8 average from runner reviews" },
  { icon: RefreshCw, label: "Free size exchanges" },
  { icon: Truck, label: "Free UK delivery over £60" },
  { icon: ShieldCheck, label: "Secure checkout" },
];

// Digital (virtual) products don't ship — swap the shipping/exchange reassurances for
// download-appropriate ones so the strip never promises delivery on a download.
const DIGITAL_TRUST = [
  { icon: Star, label: "4.8 average from runner reviews" },
  { icon: Download, label: "Instant download after purchase" },
  { icon: Smartphone, label: "Read on any device" },
  { icon: ShieldCheck, label: "Secure checkout" },
];

export function TrustStrip({ digital = false }: { digital?: boolean }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const items = digital ? DIGITAL_TRUST : TRUST;

  React.useEffect(() => {
    if (!api) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => api.scrollNext(), 2800);
    return () => clearInterval(id);
  }, [api]);

  return (
    <div className="border-b border-border bg-surface-muted">
      {/* Mobile: autoplay slider */}
      <div className="sm:hidden">
        <Carousel setApi={setApi} opts={{ loop: true, align: "center" }} aria-label="Store reassurances">
          <CarouselContent>
            {items.map(({ icon: Icon, label }) => (
              <CarouselItem key={label} className="basis-full">
                <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 body-sm text-muted-foreground">
                  <Icon className="size-3.5 shrink-0 text-foreground" aria-hidden="true" />
                  {label}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Desktop: inline row */}
      <ul className="mx-auto hidden max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-2.5 sm:flex md:px-8 lg:px-16">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="inline-flex items-center gap-1.5 body-sm text-muted-foreground">
            <Icon className="size-3.5 shrink-0 text-foreground" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
