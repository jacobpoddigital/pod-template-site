"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Numbered pagination (opt-in via PAGINATION_MODE="numbered"). URL-driven crawlable <Link>
// anchors so Googlebot follows pages and they're deep-linkable; rendered top AND bottom of the
// grid. Borders-over-shadows: 1px bordered cells, current page = primary fill. Windowed numbers
// with ellipsis keep the control compact on large catalogues.

// First · last · current±1, gaps marked with an ellipsis sentinel (-1).
function pageWindow(current: number, total: number): number[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: number[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push(-1); // ellipsis gap
    out.push(p);
    prev = p;
  }
  return out;
}

const CELL =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-md border border-border px-3 body-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function Pagination({ page, totalPages, className }: { page: number; totalPages: number; className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p <= 1) params.delete("page"); // page 1 is the clean canonical URL
    else params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const cells = pageWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-end gap-1.5", className)}>
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" aria-label="Previous page" className={CELL}>
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(CELL, "cursor-not-allowed opacity-40")}>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {cells.map((p, i) =>
        p === -1 ? (
          <span key={`gap-${i}`} aria-hidden="true" className="inline-flex h-11 w-7 items-center justify-center text-muted-foreground">
            …
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className={cn(CELL, "border-primary bg-primary text-primary-foreground")}>
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} aria-label={`Page ${p}`} className={CELL}>
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" aria-label="Next page" className={CELL}>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(CELL, "cursor-not-allowed opacity-40")}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
