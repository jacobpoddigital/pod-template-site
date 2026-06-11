import Image from "next/image";
import { Star } from "lucide-react";
import { Section } from "@/ui/section";
import { Card, CardContent } from "@/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/ui/avatar";
import { Slider, SliderItem } from "@/ui/slider";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import { initials } from "@/lib/utils";
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

function AttributionAvatar({ r }: { r: ReviewItem }) {
  if (!r.avatar?.sourceUrl) return null;
  return (
    <Avatar size="sm">
      <AvatarImage src={r.avatar.sourceUrl} alt={r.avatar.altText ?? r.author ?? ""} />
      <AvatarFallback>{initials(r.author)}</AvatarFallback>
    </Avatar>
  );
}

function CompanyLogo({ r }: { r: ReviewItem }) {
  if (!r.company_logo?.sourceUrl) return null;
  return (
    <Image
      src={r.company_logo.sourceUrl}
      alt={r.company_logo.altText ?? ""}
      width={88}
      height={28}
      sizes="88px"
      className="ml-auto h-7 w-auto object-contain opacity-70"
    />
  );
}

function Attribution({ r }: { r: ReviewItem }) {
  if (!r.author && !r.role) return null;
  return (
    <div className="mt-6 flex items-center gap-3">
      <AttributionAvatar r={r} />
      <p className="body-sm text-ink-muted">
        {r.author ? <span className="block body-sm font-semibold text-ink">{r.author}</span> : null}
        {r.role}
      </p>
      <CompanyLogo r={r} />
    </div>
  );
}

function ReviewItemView({ r }: { r: ReviewItem }) {
  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col pt-6">
        {typeof r.rating === "number" ? <Rating value={r.rating} /> : null}
        <blockquote className="body-lg text-ink">&ldquo;{r.quote}&rdquo;</blockquote>
        <Attribution r={r} />
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
