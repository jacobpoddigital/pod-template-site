import { Section } from "@/ui/section";
import { Stars } from "@/app/(shop)/shop/_components/stars";
import { ReviewsList } from "./reviews-list";
import type { ProductDetail, ProductReview } from "@/lib/commerce/products";

// P7 — runner reviews. Real seeded review comments (author + rating + body + date) via
// WooGraphQL. Distribution bars computed from the fetched reviews — honest counts, no inflation.
// The sortable/filterable card list is the client ReviewsList; summary + distribution stay server.

function Distribution({ reviews }: { reviews: ProductReview[] }) {
  const total = reviews.length;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: total ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100) : 0,
  }));
  return (
    <div className="flex flex-col gap-1.5" aria-hidden="true">
      {counts.map(({ star, pct }) => (
        <div key={star} className="flex items-center gap-2.5 body-sm">
          <span className="w-8 shrink-0 text-muted-foreground">{star} ★</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
          </div>
          <span className="w-9 shrink-0 text-right text-muted-foreground">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

export function ReviewsSection({ product }: { product: ProductDetail }) {
  const { reviews } = product;
  // Per-product Advanced-tab toggle: a merchant can disable reviews on a product — hide the whole
  // section (not just when empty). reviewsAllowed defaults true (null/true) in the mapper.
  if (!product.reviewsAllowed || !reviews.length) return null;
  const avg = product.averageRating ?? 0;

  return (
    <Section dataBlock="pdp_reviews" padding="default" className="scroll-mt-24">
      <div id="reviews" className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="display-sm text-foreground">Runner reviews</h2>
          <div className="mt-3 flex items-center gap-3">
            <Stars rating={avg} reviewCount={null} />
            <span className="body-sm text-muted-foreground">
              <strong className="text-foreground">{avg.toFixed(1)} / 5</strong> from {reviews.length} verified{" "}
              {reviews.length === 1 ? "purchase" : "purchases"}
            </span>
          </div>
        </div>
        <div className="w-full max-w-xs">
          <Distribution reviews={reviews} />
        </div>
      </div>

      <div className="mt-10">
        <ReviewsList reviews={reviews} />
      </div>
    </Section>
  );
}
