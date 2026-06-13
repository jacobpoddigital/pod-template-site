// Widget slugs an editor can drop into a block's widget slot (the headless-native
// "shortcode"). A site registers its bespoke widgets here AND in registry.tsx.
// Kept separate from registry.tsx (which imports client components) so zod schemas
// can validate against the list without pulling client code into the schema graph.
//
// The template ships NO widgets — add a site's slugs here, e.g. ["hero-chat"] as const.
export const WIDGET_SLUGS = [] as const satisfies readonly string[];
export type WidgetSlug = (typeof WIDGET_SLUGS)[number];
