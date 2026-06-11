import { z } from "zod";
import { sectionSettingsFields } from "@/lib/section-settings";

const logo = z.object({ name: z.string() });

export const logoStripSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  logos: z.array(logo).nullish(),
});

export type LogoStripProps = z.infer<typeof logoStripSchema>;
