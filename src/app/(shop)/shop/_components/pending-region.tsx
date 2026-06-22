"use client";

import { cn } from "@/lib/utils";
import { useShopFilters } from "../_lib/use-shop-filters";

// Grid pending feedback (category-listing UX standard): during a filter/sort/page navigation the
// server re-renders while the transition keeps the old grid mounted — dim it + mark aria-busy so
// the change is acknowledged (never a blank flash). Mirrors the sidebar's isPending treatment so
// the WHOLE results area, not just the controls, signals "updating".
export function PendingRegion({ children }: { children: React.ReactNode }) {
  const { isPending } = useShopFilters();
  return (
    <div className={cn("motion-safe:transition-opacity", isPending && "opacity-60")} aria-busy={isPending}>
      {children}
    </div>
  );
}
