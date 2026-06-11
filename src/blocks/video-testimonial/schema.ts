import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// video_testimonial — testimonials with a click-to-load video (VideoFacade) plus a
// pull-quote. Higher-trust social proof than text alone. ACF names 1:1.
export const videoTestimonialSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  items: z
    .array(
      z.object({
        video_id: z.string().min(1),
        quote: z.string().nullish(),
        author: z.string().nullish(),
        role: z.string().nullish(),
        facade_image: imageSchema,
      }),
    )
    .nullish(),
});

export type VideoTestimonialProps = z.infer<typeof videoTestimonialSchema>;
