import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// integrations_grid — logo/app grid with optional links ("works with…"). ACF names 1:1.
export const integrationsGridSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        url: z.string().nullish(),
        logo: imageSchema,
      }),
    )
    .nullish(),
});

export type IntegrationsGridProps = z.infer<typeof integrationsGridSchema>;
