"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/ui/sheet";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import type { ShopFacets, FacetMembership } from "@/lib/commerce/facet-logic";
import { useShopFilters, FACET_GROUPS, type FacetGroupKey } from "../_lib/use-shop-filters";
import { useStagedFilters } from "../_lib/use-staged-filters";
import { ShopFilters } from "./shop-filters";

// Responsive filter presentation (Baymard / Gymshark): desktop = persistent sidebar, LIVE
// (auto-apply per click). Mobile = full-screen takeover that STAGES selections locally — the
// "See N products" count + facet counts preview instantly (client-computed from the universe);
// "See N" applies the whole draft at once, the ✕/overlay cancels (discards the draft).
//
// MOBILE STICKY TRIGGER: the filter button is also pinned to the bottom of the viewport and slides
// up once the inline (top) trigger scrolls out of view — so filters stay reachable no matter how far
// you scroll (mirrors the PDP sticky-buy-cta). Both triggers open the SAME staged sheet (controlled
// `open` state); an active-filter count badge shows when filters are applied.
export function ShopControls({
  facets,
  universe,
  labels,
  omit,
  basePath,
}: {
  facets: ShopFacets;
  universe: FacetMembership[];
  labels: ShopFacets;
  omit?: FacetGroupKey[];
  /** Path mobile Apply commits to — defaults to /shop; locked landing pages pass their route. */
  basePath?: string;
}) {
  const urlCtl = useShopFilters();
  const staged = useStagedFilters(universe, labels, basePath);
  const [open, setOpen] = React.useState(false);

  const onOpenChange = (o: boolean) => {
    if (o) staged.reset(); // sync the draft to the currently-applied filters on open
    setOpen(o); // close without apply = cancel (the draft is discarded on next open)
  };
  const count = staged.previewCount;

  // Count of APPLIED filters (facet values + in-stock + price), shown as a badge on both triggers.
  const activeCount =
    FACET_GROUPS.reduce((n, g) => n + (omit?.includes(g.key) ? 0 : urlCtl.csv(g.key).length), 0) +
    (urlCtl.get("instock") ? 1 : 0) +
    (urlCtl.get("min") || urlCtl.get("max") ? 1 : 0);

  // Sticky bottom bar shows once the inline trigger leaves the viewport.
  const inlineRef = React.useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = React.useState(false);
  React.useEffect(() => {
    const el = inlineRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry!.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Both filter triggers (inline + sticky) share ONE button definition — same purpose, same global
  // handling: the `secondary` variant + the Button's `icon` prop (consistent icon placement/hover),
  // differing only in `size` (allowed). Avoids the divergence of a hand-placed icon / mismatched variant.
  const filterTrigger = (size: "md" | "lg") => (
    <Button
      type="button"
      variant="secondary"
      size={size}
      icon={SlidersHorizontal}
      iconPosition="leading"
      className="w-full"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => onOpenChange(true)}
    >
      Filter &amp; sort
      {activeCount > 0 && (
        <Badge variant="default" className="ml-0.5">
          {activeCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      {/* Desktop sidebar — sticky so filters stay reachable while scrolling the grid (same intent as
          the mobile sticky bar). `self-start` keeps it from stretching to the grid row height (sticky
          needs that); `top-24` clears the sticky header; a long facet list scrolls within the panel. */}
      <aside
        aria-label="Filter products"
        className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-1"
      >
        <ShopFilters facets={facets} ctl={urlCtl} idPrefix="shop-d" omit={omit} showSort={false} />
      </aside>

      <div className="lg:hidden">
        {/* Inline trigger (top of results) */}
        <div ref={inlineRef}>{filterTrigger("md")}</div>

        {/* Sticky bottom trigger — FADES in once the inline one scrolls away (opacity, not a transform;
            transform-slide wobbles on iOS). safe-area-inset restored: the inset was NOT the shake cause
            (constant-pad experiment didn't fix it on device) — iOS scroll shake is STILL OPEN, see
            PROJECT_PLAN "NEXT SESSION" (next suspect: visualViewport API). */}
        <div
          className={
            "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface lg:hidden " +
            "pb-[env(safe-area-inset-bottom)] motion-safe:transition-opacity motion-safe:duration-200 " +
            (stuck ? "opacity-100" : "pointer-events-none opacity-0")
          }
          aria-hidden={!stuck}
          inert={!stuck}
        >
          <div className="px-4 py-3">{filterTrigger("md")}</div>
        </div>

        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="left" className="flex w-full max-w-none flex-col p-0">
            <SheetHeader className="shrink-0 border-b border-border p-4">
              <SheetTitle>Filter &amp; sort</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {/* staged controller → preview facets + instant counts; nothing commits until Apply */}
              <ShopFilters facets={staged.previewFacets} ctl={staged} idPrefix="shop-m" omit={omit} />
            </div>
            <div className="shrink-0 border-t border-border bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button
                type="button"
                size="md"
                className="w-full"
                onClick={() => {
                  staged.apply();
                  setOpen(false);
                }}
              >
                See {count} {count === 1 ? "shoe" : "shoes"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
