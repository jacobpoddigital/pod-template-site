import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

const item = z.object({ question: z.string(), answer: z.string() });

export const faqSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  items: z.union([z.array(item), z.literal(false)]).nullish(),
});

export type FaqProps = z.infer<typeof faqSchema>;
