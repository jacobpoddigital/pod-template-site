import Image from "next/image";
import { ButtonLink } from "@/ui/button-link";
import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import type { FeatureRowsProps } from "./schema";

type Row = NonNullable<FeatureRowsProps["rows"]>[number];

function RowMedia({ row }: { row: Row }) {
  if (!row.image?.sourceUrl) return null;
  return (
    <div className="relative aspect-video overflow-hidden rounded-card bg-surface-muted">
      <Image
        src={row.image.sourceUrl}
        alt={row.image.altText ?? ""}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}

function FeatureRow({ row, flip }: { row: Row; flip: boolean }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      {/* Image leads on mobile; alternates sides on desktop via order. */}
      <div className={flip ? "lg:order-2" : ""}>
        <RowMedia row={row} />
      </div>
      <div className={flip ? "lg:order-1" : ""}>
        {row.eyebrow ? <p className="label text-brand-accent">{row.eyebrow}</p> : null}
        <h3 className="mt-2 display-sm text-ink">{row.title}</h3>
        {row.body ? (
          <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{row.body}</p>
        ) : null}
        {row.cta_label && row.cta_url ? (
          <div className="mt-6">
            <ButtonLink href={row.cta_url} variant="outline">
              {row.cta_label}
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FeatureRows({
  heading,
  intro,
  rows,
  tone,
  spacing,
  container,
}: FeatureRowsProps) {
  const items = Array.isArray(rows) ? rows : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="feature_rows" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-16">
        {items.map((row, i) => (
          <FeatureRow key={`${row.title}-${i}`} row={row} flip={i % 2 === 1} />
        ))}
      </div>
    </Section>
  );
}
