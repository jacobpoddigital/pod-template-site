"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

// House on/off control — always pair with <Label htmlFor={id}>. Borders-over-shadows: the track
// reads via a 1px border + surface tone (not a shadow); the thumb is a bordered surface disc.

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border " +
        "border-border bg-surface-muted outline-none " +
        "data-[state=checked]:border-success data-[state=checked]:bg-success " +
        "disabled:cursor-not-allowed disabled:opacity-50 " +
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
        "motion-safe:transition-colors",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        // White thumb with a 2px outline that MATCHES ITS TRACK in each state — grey (surface-muted)
        // on the OFF track, success-green on the ON track — and an inset gap so the thumb never
        // touches the edge. Symmetric, soft, contrasts in both colour modes.
        "pointer-events-none block size-5 rounded-full border-2 border-surface-muted bg-background " +
          "translate-x-0.5 data-[state=checked]:translate-x-[1.375rem] " +
          "data-[state=checked]:border-success " +
          "motion-safe:transition-transform",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
