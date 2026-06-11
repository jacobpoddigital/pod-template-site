import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// Tabbed content — labelled tabs, each holding rich-text (WP WYSIWYG) content.
// Content is sanitised server-side before it reaches the client tabs. ACF names 1:1.
export const tabbedContentSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  tabs: z
    .array(
      z.object({
        label: z.string().min(1),
        content: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type TabbedContentProps = z.infer<typeof tabbedContentSchema>;
