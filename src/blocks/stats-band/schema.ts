import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// A clean KPI row (value · label · optional description). Supporting proof only —
// raw numbers have the lowest recall (KB conversion), so this is texture, not a hero.
// Distinct from stat_with_source, which carries a citation. ACF names 1:1.
export const statsBandSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  stats: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().nullish(),
        description: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type StatsBandProps = z.infer<typeof statsBandSchema>;
