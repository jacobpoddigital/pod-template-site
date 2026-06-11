"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Sticky, scroll-aware header shell (roadmap H2). Stays opaque (never translucent —
// NN/G), hides on scroll-down and reveals on scroll-up past a threshold, so it gives
// back vertical space while reading but is one swipe away. Header content is passed
// as server-rendered children (slot-bridge — only this shell is a client component).
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = React.useState(false);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      // Reveal near the top; otherwise hide on down, show on up (8px deadzone).
      if (y < 80) setHidden(false);
      else if (y - lastY.current > 8) setHidden(true);
      else if (lastY.current - y > 8) setHidden(false);
      lastY.current = y;
    }
    lastY.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      aria-label="Main"
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-surface motion-safe:transition-transform motion-safe:duration-200",
        hidden && "-translate-y-full",
      )}
    >
      {children}
    </header>
  );
}
