import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// feature_rows — alternating (zig-zag) media + text rows. One block enforces the
// alternation rhythm rather than chaining media_text by hand. ACF names 1:1.
export const featureRowsSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  rows: z
    .array(
      z.object({
        eyebrow: z.string().nullish(),
        title: z.string().min(1),
        body: z.string().nullish(),
        cta_label: z.string().nullish(),
        cta_url: z.string().nullish(),
        image: imageSchema,
      }),
    )
    .nullish(),
});

export type FeatureRowsProps = z.infer<typeof featureRowsSchema>;
