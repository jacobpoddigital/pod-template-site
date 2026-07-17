import { registry } from "./registry";
import { toAnchorId } from "@/lib/section-settings";
import { cn } from "@/lib/utils";
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
        // Governed escape hatch (workflow/29): an editor-set `custom_class` is applied here on a
        // wrapper — one place, so every block (current + future) gets scoped-CSS restyling for free,
        // no per-block wiring. Scoped CSS then targets `.<class> [data-block="…"] …`.
        const customClass = typeof props.custom_class === "string" ? props.custom_class : "";
        return anchor || customClass ? (
          <div key={key} id={anchor || undefined} className={cn(anchor && "scroll-mt-24", customClass) || undefined}>
            <entry.Component {...props} />
          </div>
        ) : (
          <entry.Component key={key} {...props} />
        );
      })}
    </>
  );
}
