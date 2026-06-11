import { z } from "zod";
import { heroSchema, Hero } from "./hero";
import { featureGridSchema, FeatureGrid } from "./feature-grid";
import { faqSchema, Faq } from "./faq";
import { ctaBannerSchema, CtaBanner } from "./cta-banner";
import { logoStripSchema, LogoStrip } from "./logo-strip";
import { contactFormSchema, ContactFormBlock } from "./contact-form";
import { mediaTextSchema, MediaText } from "./media-text";
import { cardGridSchema, CardGrid } from "./card-grid";
import { servicesGridSchema, ServicesGrid } from "./services-grid";
import { uspBarSchema, UspBar } from "./usp-bar";
import { reviewsSchema, Reviews } from "./reviews";
import { richTextSchema, RichTextBlock } from "./rich-text";
import { columnsSchema, Columns } from "./columns";
import { videoSchema, Video } from "./video";
import { keyTakeawaysSchema, KeyTakeaways } from "./key-takeaways";
import { statWithSourceSchema, StatWithSource } from "./stat-with-source";
import { comparisonTableSchema, ComparisonTable } from "./comparison-table";
import { authorBylineSchema, AuthorByline } from "./author-byline";
import { postGridSchema, PostGrid, type PostGridProps } from "./post-grid";

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
  media_text: defineBlock(mediaTextSchema, MediaText),
  card_grid: defineBlock(cardGridSchema, CardGrid),
  services_grid: defineBlock(servicesGridSchema, ServicesGrid),
  usp_bar: defineBlock(uspBarSchema, UspBar),
  reviews: defineBlock(reviewsSchema, Reviews),
  rich_text: defineBlock(richTextSchema, RichTextBlock),
  columns: defineBlock(columnsSchema, Columns),
  video: defineBlock(videoSchema, Video),
  key_takeaways: defineBlock(keyTakeawaysSchema, KeyTakeaways),
  stat_with_source: defineBlock(statWithSourceSchema, StatWithSource),
  comparison_table: defineBlock(comparisonTableSchema, ComparisonTable),
  author_byline: defineBlock(authorBylineSchema, AuthorByline),
  // post_grid is an async (fetching) server component — cast to satisfy the
  // ComponentType signature; React renders async server components fine.
  post_grid: defineBlock(postGridSchema, PostGrid as unknown as React.ComponentType<PostGridProps>),
};
