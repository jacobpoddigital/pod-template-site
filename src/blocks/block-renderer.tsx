import { registry } from "./registry";
import { toAnchorId } from "@/lib/section-settings";
import type { CmsBlock } from "@/lib/cms";

// Renders any CMS page: maps each ACF Flexible Content row to its registered
// block. Per-block zod parse happens HERE (lib/cms validates the envelope only)
// — bad content fails loudly at build/ISR, never silently renders wrong.
// An editor-set `anchor` wraps the block in an id'd target (in-page #nav), with
// scroll-margin so it isn't hidden under a future sticky header — applied once
// here so no block component needs to know about it.

export function BlockRenderer({ blocks }: { blocks: CmsBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const entry = registry[block.layout];
        if (!entry) {
          throw new Error(
            `No block registered for ACF layout "${block.layout}" — add it to src/blocks/registry.tsx`,
          );
        }
        const props = entry.schema.parse(block.data);
        const key = `${block.layout}-${index}`;
        const anchor = toAnchorId(typeof props.anchor === "string" ? props.anchor : "");
        return anchor ? (
          <div key={key} id={anchor} className="scroll-mt-24">
            <entry.Component {...props} />
          </div>
        ) : (
          <entry.Component key={key} {...props} />
        );
      })}
    </>
  );
}
