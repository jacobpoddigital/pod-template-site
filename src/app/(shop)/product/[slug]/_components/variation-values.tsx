"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

// Option-value buttons for the PDP variation selector (size/width chips + colour swatches), split
// out of variation-selector.tsx to keep that file under the length budget. Pure presentational.

// Whole product unavailable — render a notice instead of a dead selector.
export function OutOfStockNotice() {
  return (
    <div className="rounded-md border border-border bg-surface-raised p-4">
      <p className="body-sm font-medium text-foreground">Out of stock</p>
      <p className="mt-1 body-sm text-muted-foreground">
        This product is currently unavailable.{" "}
        <Link href="/shop" className="text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Browse similar shoes
        </Link>
      </p>
    </div>
  );
}

const norm = (s: string) => s.trim().toLowerCase();

// Named colourways → a swatch fill. Unknown names fall back to a neutral chip (no fabricated hex).
const COLOUR_HEX: Record<string, string> = {
  black: "#111111", white: "#f5f5f5", grey: "#9ca3af", gray: "#9ca3af", silver: "#cbd5e1",
  navy: "#1e293b", blue: "#2563eb", teal: "#0d9488", green: "#16a34a", lime: "#84cc16",
  volt: "#d4ff00", yellow: "#eab308", orange: "#f97316", coral: "#fb7185", red: "#dc2626",
  pink: "#ec4899", sand: "#d6c7a1", purple: "#7c3aed", brown: "#92400e",
};

export type ValueProps = { value: string; isSelected: boolean; reachable: boolean; tabbable: boolean; onSelect: () => void };

const valueAria = (p: ValueProps) => ({
  type: "button" as const,
  role: "radio" as const,
  "aria-checked": p.isSelected,
  "aria-label": p.reachable ? p.value : `${p.value} — unavailable`,
  tabIndex: p.tabbable ? 0 : -1,
  onClick: p.onSelect,
});

export function ColourSwatch(p: ValueProps) {
  const hex = COLOUR_HEX[norm(p.value)];
  return (
    <button
      {...valueAria(p)}
      title={p.value}
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        p.isSelected ? "border-primary" : "border-border hover:border-foreground/40",
        !p.reachable && "opacity-40",
      )}
    >
      <span className="size-7 rounded-full border border-border" style={hex ? { backgroundColor: hex } : undefined}>
        {!hex && <span className="sr-only">{p.value}</span>}
      </span>
      {!p.reachable && <span aria-hidden className="absolute inset-0 m-auto h-px w-9 rotate-45 bg-muted-foreground/70" />}
    </button>
  );
}

export function ValueChip(p: ValueProps) {
  return (
    <button
      {...valueAria(p)}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-4 body-sm font-medium transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        p.isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground hover:bg-surface-muted",
        !p.reachable && "text-muted-foreground line-through opacity-50",
      )}
    >
      {p.value}
    </button>
  );
}
