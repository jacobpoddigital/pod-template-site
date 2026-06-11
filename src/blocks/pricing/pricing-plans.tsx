"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { ButtonLink } from "@/ui/button-link";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import { columnsClass } from "@/lib/section-settings";
import type { PricingPlan } from "./schema";

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
        <Tabs
          value={annual ? "annual" : "monthly"}
          onValueChange={(v) => setAnnual(v === "annual")}
          className="mb-10 flex justify-center"
        >
          <TabsList aria-label="Billing period">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual</TabsTrigger>
          </TabsList>
        </Tabs>
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
