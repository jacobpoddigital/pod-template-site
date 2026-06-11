import { z } from "zod";
import { toneSchema } from "@/lib/tone";
import { imageSchema } from "@/lib/media";

// ACF field names match the layout 1:1. Empty optional text → ACF null → .nullish().
export const heroSchema = z.object({
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  subheading: z.string().nullish(),
  cta_label: z.string().nullish(),
  cta_url: z.string().nullish(),
  secondary_label: z.string().nullish(),
  secondary_url: z.string().nullish(),
  image: imageSchema,
  // text = copy only · split = copy beside image · overlay = copy over image
  layout: z.enum(["text", "split", "overlay"]).nullish(),
  tone: toneSchema,
});

export type HeroProps = z.infer<typeof heroSchema>;
