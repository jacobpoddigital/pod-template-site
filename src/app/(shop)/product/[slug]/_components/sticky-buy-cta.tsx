"use client";

import * as React from "react";
import { useBuyCta, type BuyCta } from "./buy-cta-context";

// Resolve what the bar shows from the published CTA (or sensible fallbacks before any selection).
function ctaView(cta: BuyCta | null | undefined, fallbackPrice: string | null) {
  const kind = cta?.kind ?? "select";
  return {
    kind,
    label: cta?.label ?? "Select size & add to bag",
    price: cta?.price ?? fallbackPrice,
    disabled: kind === "oos",
  };
}

// Mobile sticky buy bar (< lg). Mirrors the buy box's live state via BuyCta context:
//  - "select" → scrolls to the buy box (size not chosen yet)
//  - "add"    → adds the resolved item to the bag (and opens the drawer), like the buy-box button
//  - "oos"    → disabled "Out of stock"
// Falls back to scroll-to-buy-box if there's no published state (simple/grouped/external paths).
export function StickyBuyCta({ price: fallbackPrice }: { price: string | null }) {
  const [shown, setShown] = React.useState(false);
  const cta = useBuyCta();

  React.useEffect(() => {
    const buyBox = document.getElementById("buy-box");
    if (!buyBox) return;
    // Show the bar once the buy box has scrolled out of view.
    const io = new IntersectionObserver(([entry]) => setShown(!entry!.isIntersecting), { threshold: 0 });
    io.observe(buyBox);
    return () => io.disconnect();
  }, []);

  const scrollToBuyBox = () => document.getElementById("buy-box")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const { kind, label, price, disabled } = ctaView(cta, fallbackPrice);
  const onClick = kind === "add" && cta?.onAdd ? cta.onAdd : scrollToBuyBox;

  return (
    <div
      data-block="pdp_sticky_cta"
      className={
        // Opacity fade, not a transform slide (transform-slide wobbles on iOS). iOS scroll shake is
        // STILL OPEN — see PROJECT_PLAN "NEXT SESSION" (next suspect: visualViewport API).
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface lg:hidden " +
        "pb-[env(safe-area-inset-bottom)] motion-safe:transition-opacity motion-safe:duration-200 " +
        (shown ? "opacity-100" : "pointer-events-none opacity-0")
      }
      aria-hidden={!shown}
      inert={!shown}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {price && <span className="body font-semibold text-foreground">{price}</span>}
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className="ml-auto inline-flex h-12 flex-1 items-center justify-center rounded-card bg-primary px-4 body-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
