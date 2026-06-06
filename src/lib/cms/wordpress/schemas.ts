import { z } from "zod";

// zod schemas for the WordPress REST *envelope* only. Per-block field schemas
// live with their components (src/blocks/<name>/schema.ts) and are parsed by
// BlockRenderer — lib/cms stays block-agnostic.

/** One ACF Flexible Content row: `acf_fc_layout` plus that layout's fields. */
export const wpFlexBlockSchema = z.looseObject({
  acf_fc_layout: z.string(),
});

export const wpPageSchema = z.object({
  slug: z.string(),
  title: z.object({ rendered: z.string() }),
  acf: z
    .object({
      // ACF returns `false` (not `[]`) when a flexible content field is empty.
      blocks: z.union([z.array(wpFlexBlockSchema), z.literal(false)]).optional(),
    })
    .optional(),
});

/** `GET /wp/v2/pages?slug=…` returns an array (empty when the slug doesn't exist). */
export const wpPagesResponseSchema = z.array(wpPageSchema);

export type WpPage = z.infer<typeof wpPageSchema>;
