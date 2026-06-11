import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// ACF field names match the layout 1:1. Empty optional text → ACF null → .nullish().
export const mediaTextSchema = z.object({
  ...sectionSettingsFields,
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),
  body: z.string().nullish(),
  cta_label: z.string().nullish(),
  cta_url: z.string().nullish(),
  image: imageSchema,
  // when set, the media slot shows a YouTube facade (image becomes its poster).
  video_id: z.string().nullish(),
  /** which side the media sits on at md+ (mobile always stacks media above text). */
  media_position: z.enum(["left", "right"]).nullish(),
  /** the media aspect ratio. */
  media_ratio: z.enum(["landscape", "square", "portrait", "wide"]).nullish(),
});

export type MediaTextProps = z.infer<typeof mediaTextSchema>;
