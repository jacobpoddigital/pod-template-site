import { z } from "zod";
import { toneSchema } from "@/lib/tone";

const logo = z.object({ name: z.string() });

export const logoStripSchema = z.object({
  heading: z.string().nullish(),
  logos: z.union([z.array(logo), z.literal(false)]).nullish(),
  tone: toneSchema,
});

export type LogoStripProps = z.infer<typeof logoStripSchema>;
