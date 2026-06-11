import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// timeline — a vertical chronology (date · title · body): company history,
// onboarding, roadmap. CSS connector, no dependency. ACF names 1:1.
export const timelineSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  events: z
    .array(
      z.object({
        date: z.string().nullish(),
        title: z.string().min(1),
        body: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type TimelineProps = z.infer<typeof timelineSchema>;
