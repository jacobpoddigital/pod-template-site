"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import type { ProductReview } from "@/lib/commerce/products";

// Sortable + filterable review list (Baymard: sort/filter is a PDP SHOULD). Photos + merchant
// replies are further gaps but need data we don't seed yet — see the PDP UX standard backlog.
const PAGE = 6;

type Sort = "recent" | "highest" | "lowest";
const SORTS: { key: Sort; label: string }[] = [
  { key: "recent", label: "Most recent" },
  { key: "highest", label: "Highest rated" },
  { key: "lowest", label: "Lowest rated" },
];

function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "R";
}
function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <li className="flex h-full flex-col rounded-lg border border-border bg-surface-raised p-5">
      <span className="inline-flex items-center gap-1 text-warning" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} className="size-4 fill-current" aria-hidden="true" />
        ))}
      </span>
      <p className="mt-3 flex-1 body-sm text-foreground">{review.content}</p>
      <div className="mt-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-flex size-9 items-center justify-center rounded-full bg-surface-muted body-sm font-semibold text-muted-foreground"
        >
          {initials(review.author)}
        </span>
        <div className="body-sm">
          <p className="font-medium text-foreground">{review.author}</p>
          <p className="text-muted-foreground">Verified purchase{review.date ? ` · ${formatDate(review.date)}` : ""}</p>
        </div>
      </div>
    </li>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3.5 body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground hover:bg-surface-muted",
      )}
    >
      {children}
    </button>
  );
}

export function ReviewsList({ reviews }: { reviews: ProductReview[] }) {
  const [sort, setSort] = React.useState<Sort>("recent");
  const [stars, setStars] = React.useState<number | null>(null);
  const [count, setCount] = React.useState(PAGE);

  const ratingsPresent = React.useMemo(
    () => [5, 4, 3, 2, 1].filter((s) => reviews.some((r) => r.rating === s)),
    [reviews],
  );

  const filtered = React.useMemo(() => {
    const f = stars == null ? reviews : reviews.filter((r) => r.rating === stars);
    const by: Record<Sort, (a: ProductReview, b: ProductReview) => number> = {
      recent: (a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0),
      highest: (a, b) => b.rating - a.rating,
      lowest: (a, b) => a.rating - b.rating,
    };
    return [...f].sort(by[sort]);
  }, [reviews, stars, sort]);

  const visible = filtered.slice(0, count);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="body-sm text-muted-foreground">Filter:</span>
          <Chip active={stars == null} onClick={() => { setStars(null); setCount(PAGE); }}>
            All ({reviews.length})
          </Chip>
          {ratingsPresent.map((s) => (
            <Chip key={s} active={stars === s} onClick={() => { setStars(s); setCount(PAGE); }}>
              {s} ★ ({reviews.filter((r) => r.rating === s).length})
            </Chip>
          ))}
        </div>
        <div className="ml-auto inline-flex items-center gap-2 body-sm text-muted-foreground">
          <label htmlFor="reviews-sort">Sort</label>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger id="reviews-sort" className="h-11 w-auto min-w-[10rem] body-sm" aria-label="Sort reviews">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </ul>

      {count < filtered.length && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setCount((c) => c + PAGE)}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-5 body-sm font-semibold text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Load more reviews ({filtered.length - count} more)
          </button>
        </div>
      )}
    </div>
  );
}
