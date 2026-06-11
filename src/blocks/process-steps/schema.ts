import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// process_steps — a numbered "how it works" sequence (title + body). Rendered as an
// ordered list so the numbering is semantic, not decorative. ACF names 1:1.
export const processStepsSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  steps: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type ProcessStepsProps = z.infer<typeof processStepsSchema>;
