import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// locations_map — address cards with a "view on map" link (no client API key, so
// no key leak / no map JS cost). For multi-branch / local businesses. ACF names 1:1.
export const locationsMapSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  locations: z
    .array(
      z.object({
        name: z.string().min(1),
        address: z.string().nullish(),
        maps_url: z.string().nullish(),
        phone: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type LocationsMapProps = z.infer<typeof locationsMapSchema>;
