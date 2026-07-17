import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// pricing_matrix — feature comparison across up to three plans. Pairs with the
// pricing block for buyers who want a full feature-by-feature view. ACF names 1:1.
export const pricingMatrixSchema = z.object({
  ...sectionSettingsFields,
  eyebrow: z.string().nullish(),
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  plan_labels: z.array(z.object({ label: z.string().min(1) })).nullish(),
  rows: z
    .array(
      z.object({
        feature: z.string().min(1),
        value1: z.string().nullish(),
        value2: z.string().nullish(),
        value3: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type PricingMatrixProps = z.infer<typeof pricingMatrixSchema>;
