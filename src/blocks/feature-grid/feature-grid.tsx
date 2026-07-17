import { Zap, ShieldCheck, Sparkles, Clock, Check, Gauge, Lock, Rocket, type LucideIcon } from "lucide-react";
import { Section } from "@/ui/section";
import { RichText } from "@/ui/rich-text";
import { Eyebrow } from "@/ui/eyebrow";
import { columnsClass } from "@/lib/section-settings";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { sectionProps } from "@/lib/section-settings";
import type { FeatureGridProps } from "./schema";

// Curated Lucide set — keep small (named imports stay tree-shakeable). Fallback: Sparkles.
const ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  shield: ShieldCheck,
  sparkles: Sparkles,
  clock: Clock,
  check: Check,
  gauge: Gauge,
  lock: Lock,
  rocket: Rocket,
};

export function FeatureGrid({ heading, intro, eyebrow, footnote, columns, tone, spacing, container, features }: FeatureGridProps) {
  const items = Array.isArray(features) ? features : [];
  if (items.length === 0) return null;
  return (
    <Section dataBlock="feature_grid" {...sectionProps({ tone, spacing, container })}>
      {eyebrow || heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{intro}</p> : null}
        </div>
      ) : null}
      <ul role="list" className={`grid gap-6 ${columnsClass(columns)}`}>
        {items.map((f, i) => {
          const Icon = f.icon ? (ICONS[f.icon] ?? Sparkles) : null;
          return (
            <li key={`${f.title}-${i}`}>
            <Card>
              <CardHeader>
                {Icon ? (
                  <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-card bg-brand-accent/10 text-brand-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                ) : null}
                <CardTitle className="display-xs text-ink">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="body text-ink-muted">{f.body}</p>
              </CardContent>
            </Card>
            </li>
          );
        })}
      </ul>
      {footnote ? <RichText html={footnote} className="mt-8 body-sm text-ink-muted" /> : null}
    </Section>
  );
}
