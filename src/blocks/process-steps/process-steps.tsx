import { Section } from "@/ui/section";
import { RichText } from "@/ui/rich-text";
import { SectionActions } from "@/ui/section-actions";
import { Eyebrow } from "@/ui/eyebrow";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { ProcessStepsProps } from "./schema";

export function ProcessSteps({
  heading,
  intro,
  eyebrow,
  footnote,
  cta_label,
  cta_url,
  secondary_label,
  secondary_url,
  steps,
  columns,
  tone,
  spacing,
  container,
}: ProcessStepsProps) {
  const items = Array.isArray(steps) ? steps : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="process_steps" {...sectionProps({ tone, spacing, container })}>
      {eyebrow || heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <ol className={`grid gap-8 ${columnsClass(columns)}`}>
        {items.map((s, i) => (
          <li key={`${s.title}-${i}`} className="relative">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary display-xs text-primary-foreground [font-feature-settings:'tnum']"
            >
              {i + 1}
            </span>
            <h3 className="mt-4 display-xs text-ink">{s.title}</h3>
            {s.body ? (
              <p className="mt-2 max-w-[min(45ch,90vw)] body text-ink-muted">{s.body}</p>
            ) : null}
          </li>
        ))}
      </ol>
      <SectionActions cta_label={cta_label} cta_url={cta_url} secondary_label={secondary_label} secondary_url={secondary_url} />
      {footnote ? <RichText html={footnote} className="mt-8 body-sm text-ink-muted" /> : null}
    </Section>
  );
}
