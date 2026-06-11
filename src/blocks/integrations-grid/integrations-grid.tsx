import Image from "next/image";
import Link from "next/link";
import { Section } from "@/ui/section";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { IntegrationsGridProps } from "./schema";

type Item = NonNullable<IntegrationsGridProps["items"]>[number];

function Tile({ it }: { it: Item }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-card border border-border bg-card p-4">
      {it.logo?.sourceUrl ? (
        <Image
          src={it.logo.sourceUrl}
          alt={it.logo.altText ?? it.name}
          width={120}
          height={40}
          sizes="120px"
          className="h-10 w-auto object-contain opacity-80"
        />
      ) : (
        <span className="body-sm font-semibold text-ink">{it.name}</span>
      )}
    </div>
  );
}

function Cell({ it }: { it: Item }) {
  if (!it.url) return <Tile it={it} />;
  return (
    <Link
      href={it.url}
      className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={it.name}
    >
      <Tile it={it} />
    </Link>
  );
}

export function IntegrationsGrid({
  heading,
  intro,
  columns,
  items,
  tone,
  spacing,
  container,
}: IntegrationsGridProps) {
  const tiles = Array.isArray(items) ? items : [];
  if (tiles.length === 0) return null;

  return (
    <Section dataBlock="integrations_grid" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-10 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <ul role="list" className={`grid gap-4 ${columnsClass(columns ?? 4)}`}>
        {tiles.map((it, i) => (
          <li key={`${it.name}-${i}`}>
            <Cell it={it} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
