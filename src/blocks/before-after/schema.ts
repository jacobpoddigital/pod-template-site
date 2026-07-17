import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// One before/after comparison (two images + optional labels + a caption under the slider).
const beforeAfterPairSchema = z.object({
  before_image: imageSchema,
  after_image: imageSchema,
  before_label: z.string().nullish(),
  after_label: z.string().nullish(),
  caption: z.string().nullish(),
});

// before_after — draggable image comparison. Two ways to use it (ACF names 1:1):
//   • ONE comparison via the top-level before_image / after_image, OR
//   • MULTIPLE via `pairs` — rendered as a responsive grid (e.g. two side by side).
export const beforeAfterSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  before_image: imageSchema,
  after_image: imageSchema,
  before_label: z.string().nullish(),
  after_label: z.string().nullish(),
  pairs: z.array(beforeAfterPairSchema).nullish(),
});

export type BeforeAfterProps = z.infer<typeof beforeAfterSchema>;
