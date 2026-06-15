import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import type { CaseStudyListItem } from "@/lib/cms";

// Case study card (the example CPT) — mirrors the blog PostCard's design-system use
// (tokens + type-scale classes, Card primitive, stretched-anchor whole-card link) but
// leads with the structured ACF proof: client/industry + the headline metric.

const DEFAULT_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

function CardThumb({ image, sizes }: { image: CaseStudyListItem["image"]; sizes?: string }) {
  if (!image?.sourceUrl) return null;
  return (
    <div className="relative aspect-[16/9] bg-surface-muted">
      <Image src={image.sourceUrl} alt={image.altText ?? ""} fill sizes={sizes ?? DEFAULT_SIZES} className="object-cover" />
    </div>
  );
}

export function CaseStudyCard({
  item,
  sizes,
  headingLevel = 2,
}: {
  item: CaseStudyListItem;
  sizes?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const headline = item.metrics[0];

  return (
    <Card interaction="link" className="flex h-full flex-col overflow-hidden">
      <CardThumb image={item.image} sizes={sizes} />

      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        {item.industry ? <Badge variant="muted" className="w-fit">{item.industry}</Badge> : null}

        {/* Stretched link makes the whole card clickable while the title stays the a11y name. */}
        <Heading className="display-xs text-ink">
          <Link href={item.href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {item.title}
          </Link>
        </Heading>

        {item.client ? <p className="body-sm text-ink-muted">{item.client}</p> : null}

        {item.summary ? <p className="body-sm text-ink-muted line-clamp-3">{item.summary}</p> : null}

        {headline ? (
          <p className="mt-auto pt-2">
            <span className="display-sm text-primary">{headline.value}</span>{" "}
            <span className="body-sm text-ink-muted">{headline.label}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** A responsive, semantic grid of case-study cards (KB 09 — 1 / 2 / 3 columns). */
export function CaseStudyCardList({ items, headingLevel }: { items: CaseStudyListItem[]; headingLevel?: 2 | 3 }) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.slug} className="flex">
          <CaseStudyCard item={item} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
