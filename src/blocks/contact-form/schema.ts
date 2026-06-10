import { z } from "zod";

export const contactFormSchema = z.object({
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  submit_label: z.string().nullish(),
  success_message: z.string().nullish(),
});

export type ContactFormProps = z.infer<typeof contactFormSchema>;
