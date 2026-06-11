import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

export const ctaBannerSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().min(1),
  body: z.string().nullish(),
  cta_label: z.string().min(1),
  cta_url: z.string().min(1),
});

export type CtaBannerProps = z.infer<typeof ctaBannerSchema>;
