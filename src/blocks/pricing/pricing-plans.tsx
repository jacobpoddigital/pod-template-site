"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { ButtonLink } from "@/ui/button-link";
import { columnsClass } from "@/lib/section-settings";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "./schema";

// Monthly/Annual is a "pick one" control, not a tab set — a radiogroup is the
// correct semantics (Radix Tabs without TabsContent leaves a dangling
// aria-controls = invalid ARIA value, per the 2026-06-12 Lighthouse audit).
// Roving tabindex + arrow-key navigation per the WAI-ARIA radiogroup pattern.
function BillingToggle({ annual, onChange }: { annual: boolean; onChange: (next: boolean) => void }) {
  const options: { value: boolean; label: string }[] = [
    { value: false, label: "Monthly" },
    { value: true, label: "Annual" },
  ];
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  function move(toIndex: number) {
    const next = options[toIndex];
    if (!next) return;
    onChange(next.value);
    refs.current[toIndex]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label="Billing period"
      className="mb-10 inline-flex items-center justify-center gap-1 rounded-lg bg-muted p-1"
    >
      {options.map((o, i) => {
        const checked = o.value === annual;
        return (
          <button
            key={o.label}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move((i + 1) % options.length);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move((i - 1 + options.length) % options.length);
              }
            }}
            className={cn(
              "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 label " +
                "outline-none motion-safe:transition-colors " +
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              checked ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function PlanPrice({ plan, annual }: { plan: PricingPlan; annual: boolean }) {
  const price = annual ? (plan.price_annual ?? plan.price) : plan.price;
  if (!price) return null;
  return (
    <p className="mt-4 flex items-baseline gap-1">
      <span className="display-md text-ink [font-feature-settings:'tnum']">{price}</span>
      <span className="body-sm text-ink-muted">{plan.period ?? (annual ? "/yr" : "/mo")}</span>
    </p>
  );
}

function PlanFeatures({ features }: { features: NonNullable<PricingPlan["features"]> }) {
  if (!features.length) return null;
  return (
    <ul role="list" className="mt-6 flex flex-1 flex-col gap-3">
      {features.map((f, i) => (
        <li key={`${f.text}-${i}`} className="flex items-start gap-2 body-sm text-ink">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" aria-hidden="true" />
          <span>{f.text}</span>
        </li>
      ))}
    </ul>
  );
}

function PlanCta({ plan }: { plan: PricingPlan }) {
  if (!plan.cta_label || !plan.cta_url) return null;
  return (
    <div className="mt-8">
      <ButtonLink
        href={plan.cta_url}
        variant={plan.featured ? "primary" : "outline"}
        className="w-full"
      >
        {plan.cta_label}
      </ButtonLink>
    </div>
  );
}

function PlanCard({ plan, annual }: { plan: PricingPlan; annual: boolean }) {
  return (
    <Card
      elevation={plan.featured ? "shadow" : "outline"}
      emphasis={plan.featured ? "featured" : "default"}
      className="flex h-full flex-col"
    >
      <CardContent className="flex flex-1 flex-col pt-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="display-xs text-ink">{plan.name}</h3>
          {plan.badge ? <Badge>{plan.badge}</Badge> : null}
        </div>
        <PlanPrice plan={plan} annual={annual} />
        {plan.description ? (
          <p className="mt-3 body-sm text-ink-muted">{plan.description}</p>
        ) : null}
        <PlanFeatures features={Array.isArray(plan.features) ? plan.features : []} />
        <PlanCta plan={plan} />
      </CardContent>
    </Card>
  );
}

export function PricingPlans({ plans }: { plans: PricingPlan[] }) {
  const hasAnnual = plans.some((p) => p.price_annual);
  const [annual, setAnnual] = React.useState(false);

  return (
    <div>
      {hasAnnual ? (
        <div className="flex justify-center">
          <BillingToggle annual={annual} onChange={setAnnual} />
        </div>
      ) : null}

      <ul role="list" className={`grid items-stretch gap-6 ${columnsClass(plans.length)}`}>
        {plans.map((plan, i) => (
          <li key={`${plan.name}-${i}`} className="h-full">
            <PlanCard plan={plan} annual={annual} />
          </li>
        ))}
      </ul>
    </div>
  );
}
