import Image from "next/image";
import Link from "next/link";
import { Card } from "@/ui/card";
import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import type { BentoGridProps } from "./schema";

type Tile = NonNullable<BentoGridProps["items"]>[number];

// Static span → grid class map (Tailwind needs whole class names). Spans only apply
// at sm+ so every tile is full-width on mobile (KB mobile-first).
const SPAN: Record<NonNullable<Tile["span"]> & string, string> = {
  normal: "",
  wide: "sm:col-span-2",
  tall: "sm:row-span-2",
  large: "sm:col-span-2 sm:row-span-2",
};

function TileBody({ t }: { t: Tile }) {
  const onImage = Boolean(t.image?.sourceUrl);
  return (
    <div
      className={
        onImage
          ? "relative z-10 flex h-full flex-col justify-end p-6 text-white"
          : "flex h-full flex-col justify-end p-6"
      }
    >
      <h3 className={onImage ? "display-xs" : "display-xs text-ink"}>{t.title}</h3>
      {t.body ? (
        <p className={onImage ? "mt-2 body-sm text-white/80" : "mt-2 body-sm text-ink-muted"}>
          {t.body}
        </p>
      ) : null}
    </div>
  );
}

function TileCard({ t }: { t: Tile }) {
  return (
    <Card
      elevation={t.image?.sourceUrl ? "flat" : "outline"}
      interaction={t.link_url ? "link" : "static"}
      className="relative h-full min-h-48 overflow-hidden"
    >
      {t.image?.sourceUrl ? (
        <>
          <Image
            src={t.image.sourceUrl}
            alt={t.image.altText ?? ""}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" aria-hidden="true" />
        </>
      ) : null}
      <TileBody t={t} />
      {t.link_url ? (
        <Link href={t.link_url} className="absolute inset-0" aria-label={t.title}>
          <span className="sr-only">{t.title}</span>
        </Link>
      ) : null}
    </Card>
  );
}

export function BentoGrid({
  heading,
  intro,
  items,
  tone,
  spacing,
  container,
}: BentoGridProps) {
  const tiles = Array.isArray(items) ? items : [];
  if (tiles.length === 0) return null;

  return (
    <Section dataBlock="bento_grid" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <ul
        role="list"
        className="grid auto-rows-[12rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {tiles.map((t, i) => (
          <li key={`${t.title}-${i}`} className={SPAN[t.span ?? "normal"]}>
            <TileCard t={t} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
