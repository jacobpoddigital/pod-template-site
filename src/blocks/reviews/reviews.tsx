import { Star } from "lucide-react";
import { Section } from "@/ui/section";
import { Card, CardContent } from "@/ui/card";
import { Slider, SliderItem } from "@/ui/slider";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { ReviewsProps } from "./schema";

type ReviewItem = NonNullable<ReviewsProps["reviews"]>[number];

function Rating({ value }: { value: number }) {
  const n = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="mb-3 flex gap-0.5" role="img" aria-label={`Rated ${n} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < n ? "h-4 w-4 fill-brand-accent text-brand-accent" : "h-4 w-4 text-border"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ReviewItemView({ r }: { r: ReviewItem }) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        {typeof r.rating === "number" ? <Rating value={r.rating} /> : null}
        <blockquote className="body-lg text-ink">&ldquo;{r.quote}&rdquo;</blockquote>
        {r.author || r.role ? (
          <p className="mt-4 text-sm text-ink-muted">
            {r.author ? <span className="font-semibold text-ink">{r.author}</span> : null}
            {r.author && r.role ? ", " : null}
            {r.role}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function Reviews({ heading, intro, columns, layout, reviews, tone, spacing, container }: ReviewsProps) {
  const items = Array.isArray(reviews) ? reviews : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="reviews" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{intro}</p> : null}
        </div>
      ) : null}

      {layout === "slider" ? (
        <Slider label={heading ?? "Reviews"}>
          {items.map((r, i) => (
            <SliderItem key={`${r.author ?? "review"}-${i}`}>
              <ReviewItemView r={r} />
            </SliderItem>
          ))}
        </Slider>
      ) : (
        <ul role="list" className={`grid gap-6 ${columnsClass(columns)}`}>
          {items.map((r, i) => (
            <li key={`${r.author ?? "review"}-${i}`}>
              <ReviewItemView r={r} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
