import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

// newsletter — inline email capture (Server Action). A distinct conversion job from
// contact_form (one field, low friction). ACF names 1:1.
export const newsletterSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  placeholder: z.string().nullish(),
  button_label: z.string().nullish(),
  success_message: z.string().nullish(),
});

export type NewsletterProps = z.infer<typeof newsletterSchema>;
