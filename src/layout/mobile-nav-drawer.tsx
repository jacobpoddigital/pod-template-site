"use client";

// Slot-bridge pattern: this Client Component leaf receives nav links from the
// Server Component Header parent. Only this file uses "use client" — never the
// Header itself (workflow/02, KB 09 §Mobile nav pattern).

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

export function MobileNavDrawer({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change — reset during render (React's recommended pattern; no effect),
  // covering back/forward nav too, not just link clicks.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Escape key + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span
          className="block h-px w-5 bg-current transition-transform motion-safe:duration-200"
          style={{ transform: open ? "rotate(45deg) translateY(4px)" : undefined }}
          aria-hidden="true"
        />
        <span
          className="my-1.5 block h-px w-5 bg-current transition-opacity motion-safe:duration-200"
          style={{ opacity: open ? 0 : 1 }}
          aria-hidden="true"
        />
        <span
          className="block h-px w-5 bg-current transition-transform motion-safe:duration-200"
          style={{ transform: open ? "rotate(-45deg) translateY(-4px)" : undefined }}
          aria-hidden="true"
        />
      </button>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="fixed inset-0 z-40 flex flex-col bg-surface px-6 pb-12 pt-24"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="border-b border-secondary py-4 text-2xl font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
