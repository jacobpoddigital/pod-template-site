import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// A compact strip of value props (icon · short text · optional link). Often on a
// muted/accent band via the `tone` setting. ACF field names 1:1.
export const uspBarSchema = z.object({
  ...sectionSettingsFields,
  columns: z.number().nullish(),
  items: z
    .array(
      z.object({
        image: imageSchema,
        text: z.string().min(1),
        link_url: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type UspBarProps = z.infer<typeof uspBarSchema>;
