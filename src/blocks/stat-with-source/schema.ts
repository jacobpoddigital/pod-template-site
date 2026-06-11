import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// A row of headline stats, each with an optional source (statistics + cited
// sources lift generative-engine visibility — workflow/04 §9). ACF names 1:1.
export const statWithSourceSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  stats: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().nullish(),
        source: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type StatWithSourceProps = z.infer<typeof statWithSourceSchema>;
