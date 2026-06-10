# src/blocks — how to add a block

Adding a section touches exactly **4 files**, never more (workflow/02):

1. **ACF layout** — add a layout to the `blocks` Flexible Content field in `wp/acf-export.json` (fields-as-code: a mu-plugin registers it; re-run `./wp/provision.sh` to sync local WP — never edit fields in wp-admin). Layout name is `snake_case`.
2. **`src/blocks/<kebab-name>/schema.ts`** — zod schema; field names match the ACF layout 1:1. Remember ACF returns `false` for empty repeaters and `null` for empty optional fields (`.nullish()`). Section blocks include `tone: toneSchema` (from `@/lib/tone`).
3. **`src/blocks/<kebab-name>/<kebab-name>.tsx`** — server component taking `z.infer` props. Imports from `@/ui` only; semantic theme tokens only (utilities — `bg-primary`, `text-ink`, `text-brand-accent` — never raw hex, never arbitrary `[--var]` reads).
   **Root MUST be `<Section dataBlock="<layout>" tone={tone}>` (`@/ui/section`) — never a raw `<section>`.** Section owns the surface, padding scale, tone, and Container, so blocks stay consistent and tone-capable by construction. Don't re-declare `bg-…`/`py-…`/`<Container>` on the section yourself.
4. **`src/blocks/registry.tsx`** — one `defineBlock(schema, dynamic(...))` entry keyed by the ACF layout name.

Plus `index.ts` re-exporting both (fixed file names — predictable repetition is what makes agents effective).

Rules:
- Blocks never fetch — they receive validated props from `<BlockRenderer>`.
- Blocks never import WP shapes — `lib/cms` is the only module that knows them.
- Also update the fallback content in `src/lib/cms/fallback.ts` if the new block appears on a fallback page.
