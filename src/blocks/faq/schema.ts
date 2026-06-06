import { z } from "zod";

// Field names match the ACF "faq" layout (wp/acf-export.json) 1:1.
// ACF returns `false` (not `[]`) for an empty repeater.
export const faqSchema = z.object({
  heading: z.string().nullish(),
  items: z.union([
    z.array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    ),
    z.literal(false),
  ]),
});

export type FaqProps = z.infer<typeof faqSchema>;
