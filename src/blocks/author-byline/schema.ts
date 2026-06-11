import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// An author byline for E-E-A-T (name · role · date · avatar · bio · profile link).
// Person JSON-LD is emitted at the page level (workflow/04 §4); this is the visible
// byline. ACF field names 1:1.
export const authorBylineSchema = z.object({
  ...sectionSettingsFields,
  name: z.string().min(1),
  role: z.string().nullish(),
  date: z.string().nullish(),
  bio: z.string().nullish(),
  profile_url: z.string().nullish(),
  avatar: imageSchema,
});

export type AuthorBylineProps = z.infer<typeof authorBylineSchema>;
