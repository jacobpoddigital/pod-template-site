import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// gallery — an image grid with a click-to-zoom lightbox (Dialog). ACF names 1:1.
export const gallerySchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  images: z
    .array(
      z.object({
        image: imageSchema,
        caption: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type GalleryProps = z.infer<typeof gallerySchema>;
