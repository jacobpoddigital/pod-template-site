import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// Pricing tiers with an optional monthly/annual toggle. One plan may be `featured`
// (the highlighted "most popular" treatment). Each plan has a single primary CTA
// (KB conversion: never multiple primaries). ACF names 1:1.
export const pricingSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  plans: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.string().nullish(),
        price_annual: z.string().nullish(),
        period: z.string().nullish(),
        description: z.string().nullish(),
        featured: z.boolean().nullish(),
        badge: z.string().nullish(),
        cta_label: z.string().nullish(),
        cta_url: z.string().nullish(),
        features: z.array(z.object({ text: z.string().min(1) })).nullish(),
      }),
    )
    .nullish(),
});

export type PricingProps = z.infer<typeof pricingSchema>;
export type PricingPlan = NonNullable<PricingProps["plans"]>[number];
