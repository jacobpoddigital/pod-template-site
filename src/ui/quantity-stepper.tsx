"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Controlled quantity stepper — the house +/- number control (borders-not-shadows, 44px targets,
// focus rings, aria). Shared by the PDP/quick-view buy box and the cart lines so every qty input
// looks + behaves identically. Respects Woo's min / max (stock or "sold individually") / step:
// values snap to `step` from `min` and clamp to `[min, max]`; the buttons disable at the bounds.
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = null,
  step = 1,
  disabled = false,
  label = "Quantity",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number | null;
  step?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const clamp = (n: number) => {
    const snapped = min + Math.round((n - min) / step) * step;
    return Math.max(min, Math.min(max ?? Infinity, snapped));
  };
  const atMin = value <= min;
  const atMax = max != null && value >= max;
  const btn =
    "flex size-11 items-center justify-center text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-md border border-border", disabled && "opacity-50", className)}
    >
      <button
        type="button"
        disabled={disabled || atMin}
        onClick={() => onChange(clamp(value - step))}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={btn}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="min-w-10 select-none text-center body-sm font-medium text-foreground" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        disabled={disabled || atMax}
        onClick={() => onChange(clamp(value + step))}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={btn}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
