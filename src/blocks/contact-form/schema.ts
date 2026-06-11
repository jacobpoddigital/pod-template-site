import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

export const contactFormSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  submit_label: z.string().nullish(),
  success_message: z.string().nullish(),
});

export type ContactFormProps = z.infer<typeof contactFormSchema>;
