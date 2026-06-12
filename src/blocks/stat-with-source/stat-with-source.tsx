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

      {/* Plain list, not a <dl>: the label is optional and the source line doesn't fit
          a dt/dd pair, so a definition list would be malformed (2026-06-12 Lighthouse
          audit). Reading order (value → label → source) conveys the pairing to AT. */}
      <ul role="list" className={`grid gap-8 ${columnsClass(columns ?? Math.min(items.length, 4))}`}>
        {items.map((s, i) => (
          <li key={`${s.value}-${i}`}>
            <p className="display-lg text-brand-accent">{s.value}</p>
            {s.label ? <p className="mt-2 body font-medium text-ink">{s.label}</p> : null}
            {s.source ? <p className="mt-1 body-sm text-ink-muted">{s.source}</p> : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
