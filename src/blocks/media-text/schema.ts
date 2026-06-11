import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// ACF field names match the layout 1:1. Empty optional text → ACF null → .nullish().
// `image` is a WPGraphQL MediaItem (ACF image field). On WPGraphQL-for-ACF v2 an
// image field may arrive as { node: MediaItem } — adjust the query fragment + this
// shape together if the regenerated schema nests it.
const imageSchema = z
  .object({
    sourceUrl: z.string(),
    altText: z.string().nullish(),
    mediaDetails: z
      .object({ width: z.number().nullish(), height: z.number().nullish() })
      .nullish(),
  })
  .nullish();

export const mediaTextSchema = z.object({
  ...sectionSettingsFields,
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  cta_label: z.string().nullish(),
  cta_url: z.string().nullish(),
  image: imageSchema,
  /** which side the media sits on at md+ (mobile always stacks media above text). */
  media_position: z.enum(["left", "right"]).nullish(),
  /** the media aspect ratio. */
  media_ratio: z.enum(["landscape", "square", "portrait", "wide"]).nullish(),
});

export type MediaTextProps = z.infer<typeof mediaTextSchema>;
