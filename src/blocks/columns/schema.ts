import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// Free rich-text columns. ACF field names 1:1.
export const columnsSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  column_count: z.number().nullish(),
  // aliased from the ACF `columns` repeater (avoids a union response-key clash with
  // the grid blocks' numeric `columns` setting).
  column_items: z
    .array(z.object({ content: z.string().nullish() }))
    .nullish(),
});

export type ColumnsProps = z.infer<typeof columnsSchema>;
