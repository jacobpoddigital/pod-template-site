import { z } from "zod";

// `icon` is a Lucide icon name (see the ICONS map in feature-grid.tsx); optional.
const feature = z.object({ title: z.string(), body: z.string(), icon: z.string().nullish() });

export const featureGridSchema = z.object({
  heading: z.string().nullish(),
  intro: z.string().nullish(),
  // ACF returns `false` (not []) for an empty repeater.
  features: z.union([z.array(feature), z.literal(false)]).nullish(),
});

export type FeatureGridProps = z.infer<typeof featureGridSchema>;
