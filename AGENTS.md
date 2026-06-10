# AGENTS.md — how to build a Pod Digital client site

You are Claude Code building a client website in this repo. This is the **how-to-build** guide;
follow it by the book. It works off-API (no Hub access), so everything you need is in this repo.

**Read first, in order:**
1. This file (the flow + the gates).
2. **`docs/standards.md`** — the enforceable design/code/perf/a11y/conversion standards. Non-negotiable.
3. **`CLAUDE.md`** — stack, commands, architecture rules, gotchas.
4. **`/project-input/`** — this client's spec (see below). Read it all before touching code.

---

## What this repo is
A **template** for one client site: Next.js (App Router, React 19, TS) + **headless WordPress**
(REST today; WPGraphQL planned, see HQ `workflow/28`) + Tailwind v4 + **shadcn/ui** primitives,
deployed on Vercel. Pages are an ordered list of **ACF flexible-content blocks** → a block
registry → typed components. Static-first (SSG/ISR): **WordPress down ≠ site down** (fallback
content keeps the build + site green).

## The handoff: `/project-input/`
The HQ pipeline drops a thin package here (HQ `workflow/27`). Read every file before building:
| File | What it is | You use it for |
|---|---|---|
| **`BUILD-SPEC.md`** | the client build contract — goal, exact brand (fonts/hex), pages + the §6 block inventory per page, conversion, WP connection | the source of truth for *what* to build |
| **`tokens.css`** | the design-system theme as the shadcn bridge `:root` | **copy into `src/styles/theme.css`** (it drops in — ADR 0012) |
| **`wireframe.html`** | the lo-fi layout reference | the section order + structure per page |

The brand values in `BUILD-SPEC.md` are **locked** — use the fonts/hex EXACTLY, never substitute.

## The build flow (do this, in order)
1. **Ingest** — read `BUILD-SPEC.md` + `wireframe.html`; `cp project-input/tokens.css src/styles/theme.css`; set `site.config.ts` (name, url, nav, footer) + create `.env` from `.env.example` (ask the human for secrets — you cannot write `.env*`).
2. **Per page, in `BUILD-SPEC.md` order** — for each §6 block not already in the registry, run the **`/new-block`** skill (`.claude/skills/new-block/`): the 4-file slice (`wp/acf-export.json` → `schema.ts` → `<block>.tsx` → `registry.tsx`) + the index re-export + the **fallback + seed parity** (`src/lib/cms/fallback.ts` + `wp/provision-content.php`, in wireframe order). Compose blocks from **shadcn primitives** (`src/ui/*`) + the semantic tokens.
3. **Copy** — run the **`/copy`** skill: land approved copy into the WP seed + `fallback.ts` + `site.config.ts` (kept in sync — the parity contract).
4. **Verify** — `pnpm lint && pnpm typecheck && pnpm build` must pass **without WordPress** (fallback proves resilience). Then `./wp/provision.sh` + `pnpm dev` and screenshot with real CMS data.
5. **PR per page** (≤ **400 lines**) — branch `feature/<page>`, commit, open a PR. **CI (lint+typecheck+build) is a required gate — you cannot merge red.** A human reviews + merges.

*(The `/brief` and `/wireframe` skills exist for when those artifacts aren't supplied; normally they arrive in `/project-input/`.)*

## How to build a block (the contract — `src/blocks/CLAUDE.md`)
Exactly: `src/blocks/<kebab>/` → `schema.ts` (Zod; ACF field names 1:1; **empty ACF repeater = `false` not `[]` → `z.union([z.array(…), z.literal(false)])`**, empty optional = `null` → `.nullish()`; section blocks add `tone: toneSchema` from `@/lib/tone`) · `<kebab>.tsx` (**Server Component**, props = `z.infer<typeof schema>`, imports `@/ui` only, token utilities only, returns `null` for empty content) · `index.ts` (re-export) · a `defineBlock(schema, dynamic(...))` entry in `registry.tsx` keyed by the ACF layout name. Blocks **never fetch** — they receive validated props.

**The block's root MUST be `<Section dataBlock="<layout>" tone={tone}>` (`@/ui/section`) — never a raw `<section>`.** `Section` owns the surface (`bg-background text-foreground`), the vertical padding scale (`padding="default|hero|compact"`), the colour-scheme `tone`, and the `Container` — so every block is consistent and tone-capable by construction. This is *how the library stays tight*: section-level concerns live in one primitive, not copy-pasted per block.

## Tokens & components
- **`theme.css` = the per-client BRAND vocabulary** (`--brand-primary`, `--brand-accent`, `--brand-surface(s)`, `--brand-ink(s)`, `--brand-border`, `--brand-error`, radius, fonts) — the handoff `tokens.css` drops in here. **`globals.css` TRANSLATES it to the shadcn bridge** (ADR 0014); that's the only place the brand→shadcn mapping lives. Rebrand = edit `theme.css` only.
- Use **token utilities, never raw hex** (lint-enforced):
  - Brand: `bg-primary` / `text-primary` (CTAs, links), `text-primary-foreground` (on primary).
  - **`bg-brand-accent` / `text-brand-accent`** = the VIBRANT decorative pop (eyebrows, icons, highlights). NOTE: shadcn's `bg-accent` is a *muted hover surface*, not the brand accent.
  - Surfaces/text: `bg-background` `bg-card` `bg-muted` `text-foreground` `text-muted-foreground` `border-border`. Agency aliases also exist: `bg-surface` `text-ink` `text-ink-muted`.
- **Section tones** — set `data-tone="muted|inverted|accent"` (via the block's `tone` prop, `src/blocks/tone.ts`) on a `<section className="bg-background text-foreground">` and the whole section + its components re-theme (one attribute remaps the local surface). Default = page surface.
- **`src/ui/` primitives** (shadcn, copied + owned — compose these, don't hand-roll elements):
  | primitive | key API |
  |---|---|
  | `Button` / `ButtonLink` | `variant`: primary·secondary·**accent**·outline·ghost·destructive · `size`: sm·md·lg (`ButtonLink` adds `href`). `accent` = the vibrant brand-accent button. |
  | `Card` (+ `CardHeader`/`CardTitle`/`CardContent`/`CardFooter`) | composition |
  | `Accordion` (+ `Item`/`Trigger`/`Content`) | `type="single" collapsible` |
  | `Input` `Textarea` `Label` `Checkbox` `Select`(+parts) `RadioGroup`(+`Item`) | form controls (label every input) |
  | `Badge` | `variant`: default·outline |
  | `Dialog` `Sheet` `Separator` `Skeleton` `Container` `Heading` `VisuallyHidden` | overlays/layout/util |
  See **`/styleguide`** for the live rendered set + tones. `src/ui/` has **no CMS knowledge**; if a `src/ui` component grows `heading`/`image_url` props, it's a block, not a primitive.

## Layer boundaries (lint-enforced — `eslint-plugin-boundaries`)
`ui → ui, lib` · `blocks → blocks, ui, lib, cms-public` · `layout → layout, ui, lib, cms-public` · `app → +blocks +layout` · only `lib/cms/` (cms-internal) sees WordPress shapes. Don't cross these.

## Gotchas (earned — see CLAUDE.md for more)
- **`WORDPRESS_API_URL` must end in `/wp-json`** — without it, every fetch silently 404s → fallback everywhere.
- **ACF returns `false` for empty repeaters/flex** — guard every access (the schema handles it; don't assume `[]`).
- **Never edit ACF field groups in wp-admin** — they're code (`wp/acf-export.json` + the mu-plugin); edits won't persist.
- **Fallback ↔ seed ↔ copy parity** — when a block/copy lands, update `fallback.ts`, `wp/provision-content.php`, and the copy doc together, in wireframe order.
- **Stale `.next`** → `rm -rf .next`. **Local WP reset** → `docker compose down -v && ./wp/provision.sh`. **Inspect REST** → `curl -s "$WORDPRESS_API_URL/wp/v2/pages?slug=home&acf_format=standard" | jq`.
- **One `priority` image per page**; `sizes` on every `<Image>`; never `loading="lazy"` above the fold.

## The non-negotiable gates (every page, before the PR)
1. `pnpm lint && typecheck && build` green **without WordPress**.
2. **Every standard in `docs/standards.md`** for the blocks you built — heading weight ≥700, `max-width:65ch`, focus ring on every interactive, labels on inputs, `prefers-reduced-motion`, container `px-4 md:px-8 lg:px-16`, 44px touch targets, one `<h1>`, `next/font`, tagged `fetch`, no raw hex.
3. Brand used **exactly** (fonts/hex from `BUILD-SPEC.md`).
4. Mobile-first verified at 375px.
5. PR ≤ 400 lines, one per page, human-reviewed.

> If you build a block that ships with a standards violation, that's a process failure — fix it in
> the same session, don't defer it. The CI gate + `docs/standards.md` are the contract.
