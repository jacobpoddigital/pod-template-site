import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Path-based pagination (workflow/34) — SEO-clean /…/page/[n], NOT ?page= (the GW port
// + boilerplate §E E6). Page 1 lives at basePath; n>1 at `${basePath}/page/${n}`. The
// route also sets rel=prev/next-equivalent canonicals in metadata. Renders nothing for
// a single page. 44px tap targets, focus rings, labelled nav (KB a11y).

function hrefFor(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

// A compact window: 1 … (cur-1, cur, cur+1) … last.
function pageWindow(current: number, total: number): number[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

const cellBase =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-md border border-border px-3 body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function BlogPagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const windowed = pageWindow(page, totalPages);

  return (
    <nav aria-label="Blog pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(basePath, page - 1)} rel="prev" aria-label="Previous page" className={cellBase}>
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
      ) : null}

      {windowed.map((p, i) => {
        const gap = i > 0 && p - windowed[i - 1]! > 1;
        const current = p === page;
        return (
          <span key={p} className="flex items-center gap-2">
            {gap ? <span className="px-1 body-sm text-ink-muted" aria-hidden>…</span> : null}
            {current ? (
              <span aria-current="page" className={cn(cellBase, "bg-secondary font-semibold text-ink")}>
                {p}
              </span>
            ) : (
              <Link href={hrefFor(basePath, p)} aria-label={`Page ${p}`} className={cn(cellBase, "hover:bg-secondary")}>
                {p}
              </Link>
            )}
          </span>
        );
      })}

      {page < totalPages ? (
        <Link href={hrefFor(basePath, page + 1)} rel="next" aria-label="Next page" className={cellBase}>
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
