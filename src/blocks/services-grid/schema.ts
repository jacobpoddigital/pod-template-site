import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// A grid of services (icon/image · title · body · optional link). ACF field names 1:1.
export const servicesGridSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  services: z
    .array(
      z.object({
        image: imageSchema,
        title: z.string().min(1),
        body: z.string().nullish(),
        link_label: z.string().nullish(),
        link_url: z.string().nullish(),
      }),
    )
    .nullish(),
});

export type ServicesGridProps = z.infer<typeof servicesGridSchema>;
