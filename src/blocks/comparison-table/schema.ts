import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// A two-option comparison table (Feature | A | B). Comparison tables lift AI
// citation (workflow/04 §9). ACF field names 1:1.
export const comparisonTableSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  option_a_label: z.string().nullish(),
  option_b_label: z.string().nullish(),
  rows: z
    .array(
      z.object({
        feature: z.string().min(1),
        option_a: z.string().nullish(),
        option_b: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type ComparisonTableProps = z.infer<typeof comparisonTableSchema>;
