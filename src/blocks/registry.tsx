import { z } from "zod";

// ACF layout name → { schema, component }. ONE entry per block.
// Keys must match `acf_fc_layout` values in wp/acf-fields/*.json exactly.
// Add blocks via the /new-block skill — it creates all 4 files and registers here.

interface BlockEntry {
  schema: z.ZodType<Record<string, unknown>>;
  Component: React.ComponentType<Record<string, unknown>>;
}

/** Pins a block's component to its schema — props and parsed data can't drift. */
export function defineBlock<P extends Record<string, unknown>>(
  schema: z.ZodType<P>,
  Component: React.ComponentType<P>,
): BlockEntry {
  return {
    schema: schema as z.ZodType<Record<string, unknown>>,
    Component: Component as React.ComponentType<Record<string, unknown>>,
  };
}

export const registry: Record<string, BlockEntry> = {
  // Add blocks here as they are built. Example:
  //   hero: defineBlock(heroSchema, dynamic(() => import('./hero').then(m => m.Hero))),
};
