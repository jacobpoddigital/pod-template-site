import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import { PricingPlans } from "./pricing-plans";
import type { PricingProps } from "./schema";

// Server shell — the Section, heading and intro stay server-rendered; only the
// monthly/annual toggle (state) lives in the PricingPlans client leaf (slot-bridge).
export function Pricing({
  heading,
  intro,
  plans,
  tone,
  spacing,
  container,
}: PricingProps) {
  const items = Array.isArray(plans) ? plans : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="pricing" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}

      <PricingPlans plans={items} />
    </Section>
  );
}
