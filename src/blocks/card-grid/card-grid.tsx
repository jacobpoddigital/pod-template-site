import Image from "next/image";
import { Section } from "@/ui/section";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { ButtonLink } from "@/ui/button-link";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { CardGridProps } from "./schema";

export function CardGrid({ heading, intro, columns, cards, tone, spacing, container }: CardGridProps) {
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

      <div className={`grid gap-6 ${columnsClass(columns)}`}>
        {items.map((c, i) => {
          const hasLink = c.link_label && c.link_url;
          return (
            <Card key={`${c.title}-${i}`} className="overflow-hidden">
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
                <CardTitle className="text-lg font-semibold text-ink">{c.title}</CardTitle>
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
        })}
      </div>
    </Section>
  );
}
