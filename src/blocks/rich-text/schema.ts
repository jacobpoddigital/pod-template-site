import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// A single WYSIWYG prose band (full_width_content). ACF field names 1:1.
export const richTextSchema = z.object({
  ...sectionSettingsFields,
  content: z.string().nullish(),
});

export type RichTextProps = z.infer<typeof richTextSchema>;
