import { z } from "zod";

const logo = z.object({ name: z.string() });

export const logoStripSchema = z.object({
  heading: z.string().nullish(),
  logos: z.union([z.array(logo), z.literal(false)]).nullish(),
});

export type LogoStripProps = z.infer<typeof logoStripSchema>;
