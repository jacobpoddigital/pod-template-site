import { z } from "zod";
import { toneSchema } from "../tone";

export const ctaBannerSchema = z.object({
  heading: z.string().min(1),
  body: z.string().nullish(),
  cta_label: z.string().min(1),
  cta_url: z.string().min(1),
  tone: toneSchema,
});

export type CtaBannerProps = z.infer<typeof ctaBannerSchema>;
