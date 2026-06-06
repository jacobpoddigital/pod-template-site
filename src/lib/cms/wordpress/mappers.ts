import type { CmsBlock, Page } from "../types";
import type { WpPage } from "./schemas";

// WP shape → normalized domain types. The ONLY place WP field names are known
// outside ./schemas.ts. A CMS swap = new adapter folder, zero component changes.

function toBlock(row: Record<string, unknown>): CmsBlock {
  const { acf_fc_layout, ...data } = row;
  return { layout: String(acf_fc_layout), data };
}

export function mapPage(wp: WpPage): Page {
  const rows = wp.acf?.blocks;
  return {
    slug: wp.slug,
    title: wp.title.rendered,
    blocks: Array.isArray(rows) ? rows.map(toBlock) : [],
  };
}
