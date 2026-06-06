import { z } from "zod";

// Field names match the ACF "card_grid" layout (wp/acf-export.json) 1:1.
// ACF returns `false` (not `[]`) for an empty repeater.
export const cardGridSchema = z.object({
  heading: z.string().nullish(),
  cards: z.union([
    z.array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
      }),
    ),
    z.literal(false),
  ]),
});

export type CardGridProps = z.infer<typeof cardGridSchema>;
