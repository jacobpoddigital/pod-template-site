import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";
import { imageSchema } from "@/lib/media";

// case_studies — result cards: client logo + headline metric + one line + link.
// An agency's strongest proof for late-stage buyers (KB conversion). ACF names 1:1.
export const caseStudiesSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  columns: z.number().nullish(),
  items: z
    .array(
      z.object({
        metric: z.string().min(1),
        summary: z.string().nullish(),
        client: z.string().nullish(),
        link_label: z.string().nullish(),
        link_url: z.string().nullish(),
        logo: imageSchema,
      }),
    )
    .nullish(),
});

export type CaseStudiesProps = z.infer<typeof caseStudiesSchema>;
