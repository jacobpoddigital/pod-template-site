import Image from "next/image";
import { Section } from "@/ui/section";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { ButtonLink } from "@/ui/button-link";
import { Slider, SliderItem } from "@/ui/slider";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { CardGridProps } from "./schema";

type CardItem = NonNullable<CardGridProps["cards"]>[number];

function CardItemView({ c }: { c: CardItem }) {
  const hasLink = c.link_label && c.link_url;
  return (
    <Card className="h-full overflow-hidden">
      {c.image?.sourceUrl ? (
        <div className="relative aspect-video bg-surface-muted">
          <Image
            src={c.image.sourceUrl}
            alt={c.image.altText ?? ""}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <CardHeader>
        <CardTitle className="text-lg font-bold text-ink">{c.title}</CardTitle>
      </CardHeader>
      {c.body || hasLink ? (
        <CardContent>
          {c.body ? <p className="leading-relaxed text-ink-muted">{c.body}</p> : null}
          {hasLink ? (
            <div className="mt-4">
              <ButtonLink href={c.link_url!} variant="ghost" size="sm">
                {c.link_label}
              </ButtonLink>
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

export function CardGrid({ heading, intro, columns, layout, cards, tone, spacing, container }: CardGridProps) {
  const items = Array.isArray(cards) ? cards : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="card_grid" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{intro}</p> : null}
        </div>
      ) : null}

      {layout === "slider" ? (
        <Slider label={heading ?? "Cards"}>
          {items.map((c, i) => (
            <SliderItem key={`${c.title}-${i}`}>
              <CardItemView c={c} />
            </SliderItem>
          ))}
        </Slider>
      ) : (
        <div className={`grid gap-6 ${columnsClass(columns)}`}>
          {items.map((c, i) => (
            <CardItemView key={`${c.title}-${i}`} c={c} />
          ))}
        </div>
      )}
    </Section>
  );
}
