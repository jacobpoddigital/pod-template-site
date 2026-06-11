import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// before_after — two images with a draggable comparison divider. ACF names 1:1.
export const beforeAfterSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  before_image: imageSchema,
  after_image: imageSchema,
  before_label: z.string().nullish(),
  after_label: z.string().nullish(),
});

export type BeforeAfterProps = z.infer<typeof beforeAfterSchema>;
