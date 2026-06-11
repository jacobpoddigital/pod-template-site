import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// A TL;DR / key-takeaways box (lifts AI-answer extractability — workflow/04 §9).
// `points` (not `items`) to keep the union response key unique. ACF names 1:1.
export const keyTakeawaysSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  points: z.array(z.object({ text: z.string().min(1) })).nullish(),
});

export type KeyTakeawaysProps = z.infer<typeof keyTakeawaysSchema>;
