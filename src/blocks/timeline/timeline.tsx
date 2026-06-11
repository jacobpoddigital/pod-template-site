import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import type { TimelineProps } from "./schema";

export function Timeline({
  heading,
  intro,
  events,
  tone,
  spacing,
  container,
}: TimelineProps) {
  const items = Array.isArray(events) ? events : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="timeline" {...sectionProps({ tone, spacing, container: container ?? "narrow" })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <ol role="list" className="relative border-l-2 border-border">
        {items.map((e, i) => (
          <li key={`${e.title}-${i}`} className="relative ml-6 pb-10 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[1.95rem] top-1 h-3 w-3 rounded-full border-2 border-surface bg-primary"
            />
            {e.date ? <p className="label text-brand-accent">{e.date}</p> : null}
            <h3 className="mt-1 display-xs text-ink">{e.title}</h3>
            {e.body ? (
              <p className="mt-2 max-w-[min(65ch,90vw)] body text-ink-muted">{e.body}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}
