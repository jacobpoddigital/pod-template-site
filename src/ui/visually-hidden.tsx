import * as React from "react";
import { cn } from "@/lib/utils";

// Primitive — visually hides content while keeping it accessible to screen readers.
// Use instead of aria-hidden when content should remain in the a11y tree.

export function VisuallyHidden({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        "[clip:rect(0,0,0,0)]",
        className
      )}
      {...props}
    />
  );
}
