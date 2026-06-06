import { z } from "zod";

// Field names match the ACF "cta_banner" layout (wp/acf-export.json) 1:1.
export const ctaBannerSchema = z.object({
  heading: z.string().min(1),
  cta_label: z.string().min(1),
  cta_url: z.string().min(1),
});

export type CtaBannerProps = z.infer<typeof ctaBannerSchema>;
