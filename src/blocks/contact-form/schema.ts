import { z } from "zod";
import { toneSchema } from "@/lib/tone";

export const contactFormSchema = z.object({
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  submit_label: z.string().nullish(),
  success_message: z.string().nullish(),
  tone: toneSchema,
});

export type ContactFormProps = z.infer<typeof contactFormSchema>;
