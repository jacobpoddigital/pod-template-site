import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// bento_grid — an asymmetric mosaic. Each tile declares a span; an optional image
// becomes a full-bleed background with a scrim. The modern feature-showcase layout.
// span ∈ normal | wide | tall | large. ACF names 1:1.
export const bentoGridSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().nullish(),
        span: z.enum(["normal", "wide", "tall", "large"]).nullish(),
        image: imageSchema,
        link_url: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type BentoGridProps = z.infer<typeof bentoGridSchema>;
