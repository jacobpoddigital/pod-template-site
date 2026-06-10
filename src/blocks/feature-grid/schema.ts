import { z } from "zod";

const feature = z.object({ title: z.string(), body: z.string() });

export const featureGridSchema = z.object({
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  // ACF returns `false` (not []) for an empty repeater.
  features: z.union([z.array(feature), z.literal(false)]).nullish(),
});

export type FeatureGridProps = z.infer<typeof featureGridSchema>;
