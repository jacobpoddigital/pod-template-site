import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// toc — table of contents / in-page nav. Each item links to a section anchor
// (the `anchor` an editor set on another block). ACF names 1:1.
export const tocSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  items: z
    .array(
      z.object({
        label: z.string().min(1),
        target: z.string().min(1),
      }),
    )
    .nullish(),
});

export type TocProps = z.infer<typeof tocSchema>;
