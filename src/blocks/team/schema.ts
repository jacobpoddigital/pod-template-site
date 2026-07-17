import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// Team / people grid (photo · name · role · bio · social links). Standard on every
// agency / professional-services site. ACF names 1:1.
export const teamSchema = z.object({
  ...sectionSettingsFields,
  eyebrow: z.string().nullish(),
  footnote: z.string().nullish(),
  cta_label: z.string().nullish(),
  cta_url: z.string().nullish(),
  secondary_label: z.string().nullish(),
  secondary_url: z.string().nullish(),
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  members: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.string().nullish(),
        bio: z.string().nullish(),
        image: imageSchema,
        linkedin_url: z.string().nullish(),
        twitter_url: z.string().nullish(),
        website_url: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type TeamProps = z.infer<typeof teamSchema>;
