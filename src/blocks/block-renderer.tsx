import { registry } from "./registry";
import type { CmsBlock } from "@/lib/cms";

// Renders any CMS page: maps each ACF Flexible Content row to its registered
// block. Per-block zod parse happens HERE (lib/cms validates the envelope only)
// — bad content fails loudly at build/ISR, never silently renders wrong.

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
        return <entry.Component key={`${block.layout}-${index}`} {...props} />;
      })}
    </>
  );
}
