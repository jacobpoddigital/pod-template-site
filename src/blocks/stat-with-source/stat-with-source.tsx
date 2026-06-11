import { Section } from "@/ui/section";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { StatWithSourceProps } from "./schema";

export function StatWithSource({ heading, intro, columns, stats, tone, spacing, container }: StatWithSourceProps) {
  const items = Array.isArray(stats) ? stats : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="stat_with_source" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{intro}</p> : null}
        </div>
      ) : null}

      <dl className={`grid gap-8 ${columnsClass(columns ?? Math.min(items.length, 4))}`}>
        {items.map((s, i) => (
          <div key={i}>
            <dd className="display-lg text-brand-accent">{s.value}</dd>
            {s.label ? <dt className="mt-2 font-medium text-ink">{s.label}</dt> : null}
            {s.source ? <p className="mt-1 text-sm text-ink-muted">{s.source}</p> : null}
          </div>
        ))}
      </dl>
    </Section>
  );
}
