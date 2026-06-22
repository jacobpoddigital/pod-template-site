import { Star } from "lucide-react";

// Star rating display (icon-library glyphs only — never a unicode ★, house rule). Renders five
// outlined stars overlaid with a clipped row of filled stars to show fractional ratings.
export function Stars({ rating, reviewCount }: { rating: number; reviewCount: number | null }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const label = `${rating.toFixed(1)} out of 5${reviewCount != null ? ` from ${reviewCount} reviews` : ""}`;
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={label}>
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex text-muted-foreground/35">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5" />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden text-warning" style={{ width: `${pct}%` }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 shrink-0 fill-current" />
          ))}
        </span>
      </span>
      <span className="body-sm text-muted-foreground" aria-hidden="true">
        {rating.toFixed(1)}
        {reviewCount != null ? ` (${reviewCount})` : ""}
      </span>
    </span>
  );
}
