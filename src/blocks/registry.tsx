import dynamic from "next/dynamic";
import { z } from "zod";
import { heroSchema } from "./hero/schema";
import { cardGridSchema } from "./card-grid/schema";
import { processStepsSchema } from "./process-steps/schema";
import { faqSchema } from "./faq/schema";
import { ctaBannerSchema } from "./cta-banner/schema";

// ACF layout name → { schema, component }. ONE entry per block — this is the
// single integration point for new blocks (workflow/02). Keys must match
// `acf_fc_layout` values in wp/acf-export.json exactly.

interface BlockEntry {
  schema: z.ZodType<Record<string, unknown>>;
  Component: React.ComponentType<Record<string, unknown>>;
}

/** Pins a block's component to its schema — props and parsed data can't drift. */
function defineBlock<P extends Record<string, unknown>>(
  schema: z.ZodType<P>,
  Component: React.ComponentType<P>,
): BlockEntry {
  return {
    schema: schema as z.ZodType<Record<string, unknown>>,
    Component: Component as React.ComponentType<Record<string, unknown>>,
  };
}

export const registry: Record<string, BlockEntry> = {
  hero: defineBlock(
    heroSchema,
    dynamic(() => import("./hero").then((m) => m.Hero)),
  ),
  card_grid: defineBlock(
    cardGridSchema,
    dynamic(() => import("./card-grid").then((m) => m.CardGrid)),
  ),
  process_steps: defineBlock(
    processStepsSchema,
    dynamic(() => import("./process-steps").then((m) => m.ProcessSteps)),
  ),
  faq: defineBlock(
    faqSchema,
    dynamic(() => import("./faq").then((m) => m.Faq)),
  ),
  cta_banner: defineBlock(
    ctaBannerSchema,
    dynamic(() => import("./cta-banner").then((m) => m.CtaBanner)),
  ),
};
