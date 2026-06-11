import { Zap, ShieldCheck, Sparkles, Clock, Check, Gauge, Lock, Rocket, type LucideIcon } from "lucide-react";
import { Section } from "@/ui/section";
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

export function FeatureGrid({ heading, intro, tone, spacing, container, features }: FeatureGridProps) {
  const items = Array.isArray(features) ? features : [];
  if (items.length === 0) return null;
  return (
    <Section dataBlock="feature_grid" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{intro}</p> : null}
        </div>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => {
          const Icon = f.icon ? (ICONS[f.icon] ?? Sparkles) : null;
          return (
            <Card key={`${f.title}-${i}`}>
              <CardHeader>
                {Icon ? (
                  <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-card bg-brand-accent/10 text-brand-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                ) : null}
                <CardTitle className="text-lg font-bold text-ink">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-ink-muted">{f.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
