# src/blocks — how to add a block

Adding a section touches the **4-file slice** + **2 lines of GraphQL wiring** (workflow/02):

1. **ACF layout** — add a layout to the `blocks` Flexible Content field in `wp/acf-fields/<site>-page-blocks.json` (fields-as-code: the mu-plugin globs `wp/acf-fields/*.json` and registers them; re-run `./wp/provision.sh` to sync local WP — never edit fields in wp-admin). Layout name is `snake_case`. Set **"Show in GraphQL"** + a pinned GraphQL Type Name per layout.
2. **`src/blocks/<kebab-name>/schema.ts`** — zod schema; field names match the ACF layout 1:1. ACF empty repeaters come back `null` over GraphQL (REST returned `false`) — `.nullish()` tolerates both. Section blocks include `tone: toneSchema` (from `@/lib/tone`).
3. **`src/blocks/<kebab-name>/<kebab-name>.tsx`** — server component taking `z.infer` props. Imports from `@/ui` only; semantic theme tokens only (utilities — `bg-primary`, `text-ink`, `text-brand-accent` — never raw hex, never arbitrary `[--var]` reads).
   **Root MUST be `<Section dataBlock="<layout>" tone={tone}>` (`@/ui/section`) — never a raw `<section>`.** Section owns the surface, padding scale, tone, and Container, so blocks stay consistent and tone-capable by construction. Don't re-declare `bg-…`/`py-…`/`<Container>` on the section yourself.
4. **`src/blocks/registry.tsx`** — one `defineBlock(schema, Component)` entry keyed by the ACF layout name, with a static import (`import { Hero } from "./hero"`).

Plus `index.ts` re-exporting both, and the **GraphQL wiring** (then `pnpm codegen`):
- **`src/lib/cms/queries/page-by-slug.graphql`** — a `... on Page_Pagefields_Blocks_<Layout> { … }` fragment selecting the fields, aliasing WPGraphQL camelCase back to the schema's snake_case (`cta_label: ctaLabel`).
- **`src/lib/cms/adapters/blocks.ts`** — a `Page_Pagefields_Blocks_<Layout> → "<layout>"` entry in the `LAYOUT` map (exhaustive over the union — codegen + typecheck won't pass until you add it).
- *(Optional)* add the block to `src/lib/cms/mock/fixtures.ts` so it renders in the offline dev mock.

Rules:
- Blocks never fetch — they receive validated props from `<BlockRenderer>`.
- Blocks never import WP shapes — `lib/cms` is the only module that knows them.
- **No `fallback.ts`** (ADR 0013) — develop before WP via the dev mock, never shippable fallback content.
- **A `z.string().min(1)` (or any required) schema field MUST be marked _Required_ in its `wp/acf-fields/*.json` field.** The renderer parses each block with Zod and throws on failure (fail-loud, ADR 0013), so a *required* field left blank by an editor would fail the page build/ISR. Marking it required in ACF stops the editor publishing it blank — the Zod rule is then a backstop, not a trap.
