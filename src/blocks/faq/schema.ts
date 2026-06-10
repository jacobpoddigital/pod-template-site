import { z } from "zod";
import { toneSchema } from "@/lib/tone";

const item = z.object({ question: z.string(), answer: z.string() });

export const faqSchema = z.object({
  heading: z.string().nullish(),
  items: z.union([z.array(item), z.literal(false)]).nullish(),
  tone: toneSchema,
});

export type FaqProps = z.infer<typeof faqSchema>;
