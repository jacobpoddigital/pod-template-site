import { z } from "zod";

// Shared shape for a WPGraphQL MediaItem (an ACF image field). One definition so
// every block's image field parses the same way. On WPGraphQL-for-ACF v2 an image
// field may arrive as { node: MediaItem } — if a regenerated schema nests it,
// adjust the query fragment + this shape together.
export const imageSchema = z
  .object({
    sourceUrl: z.string(),
    altText: z.string().nullish(),
    mediaDetails: z
      .object({ width: z.number().nullish(), height: z.number().nullish() })
      .nullish(),
  })
  .nullish();

export type CmsImage = z.infer<typeof imageSchema>;
