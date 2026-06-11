import type { CmsBlock } from "../types";
import type { PageBySlugQuery } from "../generated/graphql";

// The seam: WPGraphQL-for-ACF flexible-content union (__typename) → CmsBlock
// { layout, data }. Block props are decoupled from the transport — the whole
// point of the boundary (workflow/02). Per-block field names already match the
// zod schemas because the query aliases camelCase → snake_case.

type PageNode = NonNullable<PageBySlugQuery["page"]>;
type BlockNode = NonNullable<NonNullable<PageNode["pageFields"]>["blocks"]>[number];

// GraphQL union type name → ACF layout / registry key. Exhaustive by construction
// (Record over the union of __typename literals) — adding a block won't typecheck
// until it's mapped here.
const LAYOUT: Record<BlockNode["__typename"], string> = {
  Page_Pagefields_Blocks_Hero: "hero",
  Page_Pagefields_Blocks_FeatureGrid: "feature_grid",
  Page_Pagefields_Blocks_Faq: "faq",
  Page_Pagefields_Blocks_CtaBanner: "cta_banner",
  Page_Pagefields_Blocks_LogoStrip: "logo_strip",
  Page_Pagefields_Blocks_ContactForm: "contact_form",
  Page_Pagefields_Blocks_MediaText: "media_text",
};

export function toBlocks(
  blocks: NonNullable<PageNode["pageFields"]>["blocks"] | null | undefined,
): CmsBlock[] {
  if (!blocks) return [];
  return blocks.map((node) => {
    const { __typename, ...data } = node;
    return { layout: LAYOUT[__typename], data: data as Record<string, unknown> };
  });
}
