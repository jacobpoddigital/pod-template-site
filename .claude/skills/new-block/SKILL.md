---
name: new-block
description: Add a new CMS block to a Pod client site (blocks pattern, workflow/02). Use when asked to add a section type — hero, FAQ, pricing, testimonials — to a pod-site-* repo. Touches the 4-file slice + GraphQL wiring (query fragment, adapter map, codegen) + seed parity; never edit fields in wp-admin.
---

# /new-block — add a block to a Pod client site

First agency skill, extracted 2026-06-06 after 3 manual runs on site #1 (hero, card-grid, process-steps). Canonical copy lives in HQ `skills/`; install into a client repo as `.claude/skills/new-block/`.

## ⛔ Stop — read these before writing a single line

The knowledge base contains non-negotiables that are NOT repeated in this skill. **Call `get_knowledge(agent="build")`** (add `project_slug` if a client is set) before writing a single line — it fetches the build-stage KB from the Hub (ADR 0008). Fetching takes seconds; fixing violations after build takes much longer. The returned set gates:

| Concern | Non-negotiables |
|---|---|
| Design language | Heading weight (≥700), line-height scale, `max-width: 65ch` on all prose, spacing system, token names |
| Motion & interaction | `prefers-reduced-motion` on every transition, focus ring on every interactive element, hover/active/disabled states |
| Code & components | Server Actions for forms, `cn()` + CVA for variants, semantic landmark structure, image optimisation (`sizes`, `priority`) |
| Responsive & mobile | Container padding scale (`px-4 md:px-8 lg:px-16`), grid collapse patterns, mobile nav pattern, touch targets (44×44px), `sizes` attribute, display type clamp() values |
| Quality (forms) | axe/a11y gates — focus when the block has a form |
| Conversion (hero/pricing/CTA) | trust signals, CTA placement, phone number — focus for those block types |

The build set already includes the quality and conversion docs, so form and hero/pricing/CTA blocks need no extra call — just focus on those rows.

*Fallback if `get_knowledge` is unavailable:* read `knowledge-base/01, 02, 03, 09` (+ `05` for forms, `06` for hero/pricing/CTA).

## Inputs needed (ask if missing)

Block name (kebab for folder, `snake_case` for ACF layout) · fields + types · should local WP seed it (provision-content.php)?

## The slice — exactly these files, in this order

1. **`wp/acf-fields/<site-slug>-page-blocks.json`** — add the layout to the `blocks` flexible-content field (one site-scoped JSON file; the mu-plugin globs `wp/acf-fields/*.json` and registers on every load). Set **"Show in GraphQL" + a pinned GraphQL Type Name** per layout (that pin is what makes it a stable union member). NEVER edit field groups in wp-admin — admin edits don't persist.
2. **`src/blocks/<kebab-name>/schema.ts`** — zod schema, field names match the ACF layout 1:1. Over WPGraphQL **empty fields are `null`** (the old REST `false` is gone) — use `.nullish()` for optional fields and for empty repeaters/flexible content (which come back `null`, not `[]`). Add `tone: toneSchema` (from `@/lib/tone`) for a section block.
3. **`src/blocks/<kebab-name>/<kebab-name>.tsx`** — server component, props = `z.infer`. **Root MUST be `<Section dataBlock="<layout>" tone={tone}>` (`@/ui/section`), never a raw `<section>`.** Imports from `@/ui` only; token utilities only (`bg-primary`, `text-ink`, `text-brand-accent`, `rounded-card` — raw hex AND arbitrary `[--var]` reads are banned). Return `null` for empty content. See the `components` skill for the token system.
4. **`src/blocks/registry.tsx`** — one `defineBlock(<schema>, <Component>)` entry keyed by the ACF layout name, with a **static** import (`import { Hero } from "./hero"` — not `dynamic()`).

Plus the **GraphQL wiring** (then `pnpm codegen`) — see the `graphql-queries` skill:
- **`src/lib/cms/queries/page-by-slug.graphql`** — a `... on Page_Pagefields_Blocks_<Layout> { … }` fragment selecting the fields, aliasing WPGraphQL camelCase back to the schema's snake_case (`cta_label: ctaLabel`).
- **`src/lib/cms/adapters/blocks.ts`** — a `Page_Pagefields_Blocks_<Layout> → "<layout>"` entry in the `LAYOUT` map (exhaustive over the union — codegen + typecheck fail until you add it).
- `index.ts` re-exporting schema + component; *(optional)* add the block to `src/lib/cms/mock/fixtures.ts` so it renders in the offline dev mock.

Plus seed parity:
- **`wp/provision-content.php`** seed row if local WP should demo it — **respect the approved wireframe's section ORDER**
- *(No `fallback.ts` — ADR 0013 removed fallback content. Develop before WP via the dev mock, never shippable fallback data.)*

## Verify (all required — treat absence as a defect)

```
pnpm lint && pnpm typecheck && pnpm build          # green offline: GraphQL sites build against committed schema.graphql + generated/ (ADR 0013); legacy REST site #1 builds with no WP too
ACF_PRO_ZIP=<path> ./wp/provision.sh               # idempotent — syncs fields + reseeds
# GraphQL site: query the /graphql endpoint (or render via the dev mock, workflow/28 Step 9) and confirm the layout resolves
# Legacy REST site #1: curl -s "http://localhost:8081/wp-json/wp/v2/pages?slug=home&acf_format=standard" | grep <layout_name>
pnpm dev → screenshot → check section renders with CMS data
```

If the dev server shows missing CSS or "Client Manifest" errors after config/file churn: `rm -rf .next` and restart — stale cache, not your block.

### KB compliance checklist (tick every item before committing)

- [ ] All headings (`h1`–`h3`) use `font-weight: 700` minimum — never `font-light` / `font-normal` on display text (KB 01)
- [ ] All prose containers have `max-w-[65ch]` — no exceptions (KB 01)
- [ ] Every transition is wrapped in `motion-safe:` or `prefers-reduced-motion: no-preference` (KB 02)
- [ ] Every interactive element has a visible `:focus-visible` ring — `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` (KB 02)
- [ ] Every interactive element has a hover state — minimum: contrast change + `transition-colors duration-150` (KB 02)
- [ ] Section uses `<section aria-labelledby={id}>` with a matching heading `id` (KB 03)
- [ ] No raw hex or hardcoded colour in className — semantic tokens only (`bg-surface`, `text-ink`, `accent`) (KB 01)
- [ ] Forms: every input has a `<label htmlFor>`, correct `autocomplete` token, and `aria-describedby` error pattern (KB 03, KB 05)
- [ ] Images use `<Image>` with explicit `width`/`height`, `sizes` matching CSS layout, `priority` only on LCP (KB 04)
- [ ] Container wrapper uses `px-4 md:px-8 lg:px-16` — never `px-16` alone (KB 09)
- [ ] All grids start at `grid-cols-1` — never `grid-cols-N` without mobile collapse prefix (KB 09)
- [ ] Display type above 48px uses `clamp()` — never a fixed `text-[Xpx]` at display scale (KB 09)
- [ ] All interactive elements have `min-h-[44px]` — buttons, links in nav/lists, form inputs (KB 09)
- [ ] Hover-only content is visible unconditionally on mobile (`lg:opacity-0 lg:group-hover:opacity-100` pattern) (KB 09)
- [ ] Checked at 375px in DevTools: no horizontal scroll, nav shows hamburger, grid is single-column (KB 09)

## Markup craft (by-the-book — law: HQ `research/2026-06-06-code-craft-and-ai-readability.md`; mostly lint/verify-enforced)

- Prefer `scaffold_block_type` (pod-site MCP) for steps 2–4 — it emits the compliant skeleton: `<section aria-labelledby={headingId} data-block="<name>">` (named-section pattern; unnamed sections are invisible landmarks) with `useId()` + `Heading id`.
- `<article>` only if a card is a standalone syndicable entity (case study, post); feature cards stay `<div>`. Steps → `<ol>`; never skip heading levels (block headings are `h2`, card titles `h3`).
- ARIA minimalism: native elements first; if you're adding a `role=`, you're probably wrong (lint will object).

### Forms recipe (when the block has inputs — every rule verified to spec)

1. Native `input`/`select`/`textarea` + real `<label>` (explicit `htmlFor` is house default; div-soup controls are invisible to AT and agents — hard failure)
2. Every user-info field: correct `autocomplete` token (`name`, `email`, `tel`, `street-address`, `postal-code`…) — WCAG 2.2 AA SC 1.3.5; conventional `name` attributes (autofill keys off them)
3. `type="email"`/`type="tel"` where true; `type="number"` ONLY for incremental quantities; `inputmode="numeric"` for postcodes/cards (GOV.UK)
4. Errors: the ONE blessed pattern — `aria-describedby` on the control → error element id, `aria-live="assertive"` region announces. Never `aria-errormessage` (AT support incomplete), never colour-only.
5. Group related radios/checkboxes in `fieldset`+`legend`.

## Commit

One commit per block slice (vertical slice = the agent-sized unit, workflow/11). Mention the wireframe/review line that authorised the block.
