import { z } from "zod";

// Field names match the ACF "process_steps" layout (wp/acf-export.json) 1:1.
// ACF returns `false` (not `[]`) for an empty repeater.
export const processStepsSchema = z.object({
  heading: z.string().nullish(),
  steps: z.union([
    z.array(
      z.object({
        title: z.string().min(1),
        body: z.string().nullish(),
      }),
    ),
    z.literal(false),
  ]),
});

export type ProcessStepsProps = z.infer<typeof processStepsSchema>;
