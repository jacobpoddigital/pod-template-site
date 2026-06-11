import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// A click-to-load YouTube facade (defers the heavy iframe — KB perf). ACF names 1:1.
export const videoSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  video_id: z.string().min(1),
  facade_image: imageSchema,
  button_text: z.string().nullish(),
});

export type VideoProps = z.infer<typeof videoSchema>;
