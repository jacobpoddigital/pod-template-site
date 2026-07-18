import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

export const ctaBannerSchema = z.object({
  ...sectionSettingsFields,
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  cta_label: z.string().min(1),
  cta_url: z.string().min(1),
  secondary_label: z.string().nullish(),
  secondary_url: z.string().nullish(),
  footnote: z.string().nullish(),
});

export type CtaBannerProps = z.infer<typeof ctaBannerSchema>;
