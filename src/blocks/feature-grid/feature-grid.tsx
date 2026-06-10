import { Zap, ShieldCheck, Sparkles, Clock, Check, Gauge, Lock, Rocket, type LucideIcon } from "lucide-react";
import { Section } from "@/ui/section";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
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

export function FeatureGrid({ heading, intro, tone, features }: FeatureGridProps) {
  const items = Array.isArray(features) ? features : [];
  if (items.length === 0) return null;
  return (
    <Section dataBlock="feature_grid" tone={tone}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{heading}</h2> : null}
          {intro ? <p className="mt-4 max-w-[65ch] text-lg leading-relaxed text-ink-muted">{intro}</p> : null}
        </div>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => {
          const Icon = f.icon ? (ICONS[f.icon] ?? Sparkles) : null;
          return (
            <Card key={f.title}>
              <CardHeader>
                {Icon ? (
                  <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-card bg-brand-accent/10 text-brand-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                ) : null}
                <CardTitle className="text-lg font-semibold text-ink">{f.title}</CardTitle>
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
