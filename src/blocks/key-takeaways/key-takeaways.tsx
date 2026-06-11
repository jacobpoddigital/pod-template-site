import { Check } from "lucide-react";
import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import type { KeyTakeawaysProps } from "./schema";

export function KeyTakeaways({ heading, points, tone, spacing, container }: KeyTakeawaysProps) {
  const items = Array.isArray(points) ? points : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="key_takeaways" {...sectionProps({ tone, spacing, container: container ?? "narrow" })}>
      <div className="rounded-card border border-border bg-surface-muted p-6 md:p-8">
        <h2 className="display-md text-ink">{heading || "Key takeaways"}</h2>
        <ul className="mt-4 space-y-3">
          {items.map((p, i) => (
            <li key={i} className="flex gap-3">
              <Check className="mt-1 h-5 w-5 shrink-0 text-brand-accent" aria-hidden="true" />
              <span className="body-lg text-ink-muted">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
