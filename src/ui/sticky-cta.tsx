"use client";

import * as React from "react";
import Link from "next/link";
import { Phone } from "lucide-react";

// Sticky bottom CTA bar on mobile only (< lg) — the best-evidenced mobile
// conversion pattern (+8–31%). Appears after the user scrolls past the hero, so
// it doesn't compete with the first screen. Phone + primary CTA come from WP chrome.
export function StickyCta({
  phone,
  cta,
}: {
  phone?: string | null;
  cta?: { label: string; href: string } | null;
}) {
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setShown(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!phone && !cta) return null;

  return (
    <div
      data-block="sticky_cta"
      className={
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur lg:hidden " +
        "pb-[env(safe-area-inset-bottom)] motion-safe:transition-transform motion-safe:duration-200 " +
        (shown ? "translate-y-0" : "translate-y-full")
      }
      aria-hidden={!shown}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {phone ? (
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-card border border-border body-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call us
          </a>
        ) : null}
        {cta ? (
          <Link
            href={cta.href}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-card bg-primary px-4 body-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            {cta.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
