import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

const item = z.object({ question: z.string(), answer: z.string() });

export const faqSchema = z.object({
  ...sectionSettingsFields,
  eyebrow: z.string().nullish(),
  footnote: z.string().nullish(),
  cta_label: z.string().nullish(),
  cta_url: z.string().nullish(),
  secondary_label: z.string().nullish(),
  secondary_url: z.string().nullish(),
  heading: z.string().nullish(),
  items: z.array(item).nullish(),
});

export type FaqProps = z.infer<typeof faqSchema>;
