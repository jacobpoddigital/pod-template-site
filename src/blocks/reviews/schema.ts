import { z } from "zod";
import { sectionSettingsFields, layoutSchema } from "@/lib/section-settings";

// Testimonials (quote · author · role · 1–5 rating), as a grid or slider. ACF names 1:1.
export const reviewsSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  layout: layoutSchema,
  reviews: z
    .array(
      z.object({
        quote: z.string().min(1),
        author: z.string().nullish(),
        role: z.string().nullish(),
        rating: z.number().nullish(),
      }),
    )
    .nullish(),
});

export type ReviewsProps = z.infer<typeof reviewsSchema>;
