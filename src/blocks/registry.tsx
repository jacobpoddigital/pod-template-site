import { z } from "zod";
import { heroSchema, Hero } from "./hero";
import { featureGridSchema, FeatureGrid } from "./feature-grid";
import { faqSchema, Faq } from "./faq";
import { ctaBannerSchema, CtaBanner } from "./cta-banner";
import { logoStripSchema, LogoStrip } from "./logo-strip";
import { contactFormSchema, ContactFormBlock } from "./contact-form";

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
  hero: defineBlock(heroSchema, Hero),
  feature_grid: defineBlock(featureGridSchema, FeatureGrid),
  faq: defineBlock(faqSchema, Faq),
  cta_banner: defineBlock(ctaBannerSchema, CtaBanner),
  logo_strip: defineBlock(logoStripSchema, LogoStrip),
  contact_form: defineBlock(contactFormSchema, ContactFormBlock),
};
