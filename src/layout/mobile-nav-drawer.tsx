"use client";

// Multi-level drill-down mobile menu — mirrors the pod-digital-mobile-menu plugin:
// tap a parent to slide into its submenu, "Back" goes up one level, "Close" exits.
// Stack-based (the `path` array), reimplemented in React (no DOM walking).
// Slot-bridge pattern: only this leaf is "use client", never the Header (workflow/02).

import { useState, useEffect, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft, X, Menu } from "lucide-react";
import type { NavItem } from "@/lib/cms";

interface Level {
  title: string;
  items: readonly NavItem[];
}

// Walk the nav tree along `path` → the chain of levels currently in view.
function buildLevels(links: readonly NavItem[], path: readonly number[]): Level[] {
  const levels: Level[] = [{ title: "Menu", items: links }];
  let cursor: readonly NavItem[] = links;
  for (const idx of path) {
    const item = cursor[idx];
    if (!item?.children?.length) break;
    levels.push({ title: item.label, items: item.children });
    cursor = item.children;
  }
  return levels;
}

function Panel({
  level,
  active,
  basePath,
  onDrill,
  onNavigate,
}: {
  level: Level;
  active: boolean;
  basePath: readonly number[];
  onDrill: (path: number[]) => void;
  onNavigate: (href: string, e: MouseEvent) => void;
}) {
  return (
    <ul className="h-full w-full shrink-0 overflow-y-auto px-6 py-4" inert={!active}>
      {level.items.map((item, i) =>
        item.children?.length ? (
          <li key={item.href}>
            <button
              type="button"
              onClick={() => onDrill([...basePath, i])}
              className="flex w-full items-center justify-between border-b border-border py-4 text-left display-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
              <ChevronRight className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            </button>
          </li>
        ) : (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={(e) => onNavigate(item.href, e)}
              className="block border-b border-border py-4 display-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

export function MobileNavDrawer({ links, cta }: { links: readonly NavItem[]; cta?: { label: string; href: string } | null }) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<number[]>([]);
  const pathname = usePathname();

  // Close + reset on route change (covers back/forward nav, not just clicks).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setPath([]);
  }

  // Escape closes; lock body scroll while open.
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

  const levels = buildLevels(links, path);
  const depth = levels.length - 1;
  const close = () => {
    setOpen(false);
    setPath([]);
  };

  // Same-page anchor links: close + release the scroll-lock, THEN smooth-scroll to
  // the target. The menu's body scroll-lock (and usePathname not changing on a
  // hash-only nav) otherwise leaves you stuck — the modification this needs.
  // Cross-page links just close and let <Link> navigate.
  const handleNavigate = (href: string, e: MouseEvent) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) {
      close();
      return;
    }
    const targetPath = href.slice(0, hashIndex) || "/";
    const hash = href.slice(hashIndex + 1);
    const samePage = targetPath === pathname || (targetPath === "/" && pathname === "/");
    if (!hash || !samePage) {
      close();
      return;
    }
    e.preventDefault();
    setOpen(false);
    setPath([]);
    document.body.style.overflow = "";
    window.history.replaceState(null, "", `#${hash}`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  };

  return (
    <div className="lg:hidden">
      <button
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(true)}
        className="p-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {open ? (
        <div id="mobile-nav" className="fixed inset-0 z-50 flex flex-col bg-surface" aria-label="Mobile">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
            {depth > 0 ? (
              <button
                type="button"
                onClick={() => setPath(path.slice(0, -1))}
                className="-ml-1 flex items-center gap-1 rounded body-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                {levels[depth]?.title}
              </button>
            ) : (
              <span className="body-sm font-semibold text-ink-muted">Menu</span>
            )}
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="-mr-2 p-2 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <div
              className="flex h-full transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${depth * 100}%)` }}
            >
              {levels.map((lvl, li) => (
                <Panel
                  key={li}
                  level={lvl}
                  active={li === depth}
                  basePath={path.slice(0, li)}
                  onDrill={setPath}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>

          {cta ? (
            <div className="shrink-0 border-t border-border p-6">
              <Link
                href={cta.href}
                onClick={close}
                className="flex w-full items-center justify-center rounded-card bg-primary px-5 py-3 font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {cta.label}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
