import { z } from "zod";

// Field names match the ACF "hero" layout (wp/acf-export.json) 1:1.
export const heroSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().nullish(),
  cta_label: z.string().nullish(),
  cta_url: z.string().nullish(),
});

export type HeroProps = z.infer<typeof heroSchema>;
