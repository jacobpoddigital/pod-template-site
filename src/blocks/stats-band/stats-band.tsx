import { Section } from "@/ui/section";
import { RichText } from "@/ui/rich-text";
import { SectionActions } from "@/ui/section-actions";
import { Eyebrow } from "@/ui/eyebrow";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { StatsBandProps } from "./schema";

// A stat is a value + label (+ optional note). Rendered as a plain list, not a <dl>:
// the label is optional and the note doesn't fit a dt/dd pair, so a definition list
// would be malformed. Reading order (value → label → note) conveys the pairing to AT.
export function StatsBand({
  heading,
  intro,
  eyebrow,
  footnote,
  cta_label,
  cta_url,
  secondary_label,
  secondary_url,
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
      {eyebrow || heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <ul role="list" className={`grid gap-8 ${columnsClass(columns ?? items.length)}`}>
        {items.map((s, i) => (
          <li key={`${s.value}-${i}`} className="text-center">
            <p className="display-lg text-ink [font-feature-settings:'tnum']">{s.value}</p>
            {s.label ? <p className="mt-2 label text-ink-muted">{s.label}</p> : null}
            {s.description ? (
              <p className="mx-auto mt-2 max-w-[min(40ch,90vw)] body-sm text-ink-muted">
                {s.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      <SectionActions cta_label={cta_label} cta_url={cta_url} secondary_label={secondary_label} secondary_url={secondary_url} />
      {footnote ? <RichText html={footnote} className="mt-8 body-sm text-ink-muted" /> : null}
    </Section>
  );
}
