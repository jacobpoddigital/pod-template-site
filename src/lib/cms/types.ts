// Normalized domain types — what the rest of the app sees.
// Nothing outside lib/cms ever sees a WordPress shape (workflow/02).

/** One CMS section, not yet narrowed. `BlockRenderer` parses `data` against the
 *  matching block schema (src/blocks/<name>/schema.ts) before rendering. */
export interface CmsBlock {
  /** ACF Flexible Content layout name, e.g. "hero", "card_grid". */
  layout: string;
  data: Record<string, unknown>;
}

export interface Page {
  slug: string;
  title: string;
  blocks: CmsBlock[];
}
