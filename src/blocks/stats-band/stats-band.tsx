import { Section } from "@/ui/section";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { StatsBandProps } from "./schema";

// A stat is a value + label, marked up as a description list (dd = value, dt = label)
// so screen readers pair them. The big number is the value; the label sits under it.
export function StatsBand({
  heading,
  intro,
  columns,
  stats,
  tone,
  spacing,
  container,
}: StatsBandProps) {
  const items = Array.isArray(stats) ? stats : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="stats_band" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <dl className={`grid gap-8 ${columnsClass(columns ?? items.length)}`}>
        {items.map((s, i) => (
          <div key={`${s.value}-${i}`} className="text-center">
            <dd className="display-lg text-ink [font-feature-settings:'tnum']">{s.value}</dd>
            {s.label ? <dt className="mt-2 label text-ink-muted">{s.label}</dt> : null}
            {s.description ? (
              <p className="mx-auto mt-2 max-w-[min(40ch,90vw)] body-sm text-ink-muted">
                {s.description}
              </p>
            ) : null}
          </div>
        ))}
      </dl>
    </Section>
  );
}
