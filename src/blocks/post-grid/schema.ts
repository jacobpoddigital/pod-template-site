import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// Lists recent posts. The block's ACF fields control the query (category/count);
// the posts are fetched in the component via getRecentPosts. ACF names 1:1.
export const postGridSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  category: z.string().nullish(),
  count: z.number().nullish(),
  columns: z.number().nullish(),
});

export type PostGridProps = z.infer<typeof postGridSchema>;
