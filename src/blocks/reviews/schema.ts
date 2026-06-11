import { z } from "zod";
import { sectionSettingsFields, layoutSchema } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// Testimonials (quote · author · role · 1–5 rating · optional avatar + company logo),
// as a grid or slider. A face lifts testimonial recall sharply (KB conversion). ACF names 1:1.
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
        avatar: imageSchema,
        company_logo: imageSchema,
      }),
    )
    .nullish(),
});

export type ReviewsProps = z.infer<typeof reviewsSchema>;
