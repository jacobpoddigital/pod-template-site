"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, ChevronDown } from "lucide-react";

// Multi-location phone dropdown (mirrors Great White's location numbers). One
// number renders as a plain tel: link in the Header (server); 2+ use this.
export function PhoneMenu({ numbers }: { numbers: { location: string; number: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 items-center gap-2 rounded-card px-2 body-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Phone className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Call us</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open ? (
        <ul
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-56 rounded-card border border-border bg-card p-1 shadow-card"
        >
          {numbers.map((n) => (
            <li key={n.number} role="none">
              <a
                role="menuitem"
                href={`tel:${n.number.replace(/\s+/g, "")}`}
                onClick={() => setOpen(false)}
                className="flex flex-col rounded px-3 py-2 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              >
                <span className="body-sm font-medium text-ink">{n.location}</span>
                <span className="body-sm text-ink-muted">{n.number}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
