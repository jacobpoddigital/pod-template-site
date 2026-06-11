import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import { sanitize } from "@/lib/sanitize";
import { TabbedTabs } from "./tabbed-tabs";
import type { TabbedContentProps } from "./schema";

export function TabbedContent({
  heading,
  intro,
  tabs,
  tone,
  spacing,
  container,
}: TabbedContentProps) {
  const items = (Array.isArray(tabs) ? tabs : []).map((t) => ({
    label: t.label,
    html: sanitize(t.content ?? ""),
  }));
  if (items.length === 0) return null;

  return (
    <Section dataBlock="tabbed_content" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-10 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}
      <TabbedTabs tabs={items} />
    </Section>
  );
}
