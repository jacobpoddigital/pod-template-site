---
name: new-block
description: Add a new CMS block to this site (blocks pattern, workflow/02). Use when asked to add a section type — FAQ, pricing, testimonials, cta-banner. Touches exactly 4 files + fallback/seed parity; never edit fields in wp-admin.
---

# /new-block — add a block to this site

Installed from HQ `web-ai-automation/skills/new-block/` (canonical copy — improve it there, re-install here).

## Inputs needed (ask if missing)

Block name (kebab for folder, `snake_case` for ACF layout) · fields + types · does it appear on a fallback page?

## The slice — exactly these files, in this order

1. **`wp/acf-export.json`** — add the layout to the `blocks` flexible-content field. Keys prefixed `layout_pod_<name>` / `field_pod_<name>_<field>`. NEVER edit field groups in wp-admin — the mu-plugin registers from this JSON and admin edits don't persist.
2. **`src/blocks/<kebab-name>/schema.ts`** — zod schema, field names match ACF 1:1. ACF quirks: empty repeater/flexible = `false` (use `z.union([z.array(...), z.literal(false)])`); empty optional fields = `null` (use `.nullish()`). Add `tone: toneSchema` (from `@/lib/tone`) for a section block.
3. **`src/blocks/<kebab-name>/<kebab-name>.tsx`** — server component, props = `z.infer`. **Root MUST be `<Section dataBlock="<layout>" tone={tone}>` (`@/ui/section`), never a raw `<section>`** — Section owns the surface/padding/tone/Container, keeping every block consistent. Imports from `@/ui` only; token utilities only (`bg-primary`, `text-brand-accent`, `rounded-card` — raw hex AND arbitrary `[--var]` reads are banned). Return `null` for empty content.
4. **`src/blocks/registry.tsx`** — one `defineBlock(schema, dynamic(() => import("./<kebab-name>").then(m => m.<Component>)))` entry keyed by the ACF layout name.

Plus `index.ts` re-exporting both, and parity:
- **`src/lib/cms/fallback.ts`** if the block appears on a fallback page — fallback data must satisfy the schema
- **`wp/provision-content.php`** seed row — **respect the approved wireframe's section ORDER** in both files

## Verify (all required)

```
pnpm lint && pnpm typecheck && pnpm build          # must stay green with NO WP running
ACF_PRO_ZIP=<path> ./wp/provision.sh               # idempotent — syncs fields + reseeds
curl -s "http://localhost:8081/wp-json/wp/v2/pages?slug=home&acf_format=standard" | grep <layout_name>
pnpm dev → screenshot → check section renders with CMS data
```

If dev shows missing CSS or "Client Manifest" errors after churn: `rm -rf .next`, restart — stale cache, not your block.

## Commit

One commit per block slice. Mention the wireframe/review line that authorised the block.
