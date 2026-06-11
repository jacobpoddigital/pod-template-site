import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// A grid of image cards (image · title · body · optional link). ACF field names 1:1.
export const cardGridSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  cards: z
    .array(
      z.object({
        image: imageSchema,
        title: z.string().min(1),
        body: z.string().nullish(),
        link_label: z.string().nullish(),
        link_url: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type CardGridProps = z.infer<typeof cardGridSchema>;
