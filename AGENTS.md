# AGENTS.md — how to build a Pod Digital client site

You are Claude Code building a client website in this repo. This is the **how-to-build** guide;
follow it by the book. It works off-API (no Hub access), so everything you need is in this repo.

> For the *human* developer's end-to-end view of how a Great White Pro site gets built (your role, the
> compose-vs-bespoke-block split, the editor section-settings handoff), see **HQ `workflow/31`**. This
> file is the in-repo build recipe; workflow/31 is the surrounding workflow.

**Read first, in order:**
1. This file (the flow + the gates).
2. **`docs/standards.md`** — the enforceable design/code/perf/a11y/conversion standards. Non-negotiable.
3. **`CLAUDE.md`** — stack, commands, architecture rules, gotchas.
4. **`/project-input/`** — this client's spec (see below). Read it all before touching code.

---

## What this repo is
A **template** for one client site: Next.js (App Router, React 19, TS) + **headless WordPress via
WPGraphQL** (the sole content layer — no REST, no fallback content; ADR 0013, HQ `workflow/28`) +
Tailwind v4 + **shadcn/ui** primitives, deployed on **Vercel**. Pages are an ordered list of
**ACF flexible-content blocks** → a block registry → typed components.

Data layer (`src/lib/cms/`): `graphql-request` + `@graphql-codegen` (typed documents from the
schema — no hand-written Zod for CMS shapes). A committed **`schema.graphql`** + committed
`generated/` mean `codegen`/`typecheck`/`build` run **with no WordPress**; a **dev-only mock**
(`src/lib/cms/mock/`) renders blocks against that schema so you can build before WP exists. Static
-first (SSG/ISR): runtime resilience is ISR last-good cache; there is **no fallback content**.

## The handoff: `/project-input/`
The **synthesised handoff the build reads** — produced from the upstream brief → wireframe → copy stages (drafted in-repo today per HQ `workflow/01`, or delivered by the Hub pipeline — the target, HQ `workflow/27`). Read every file before building:
| File | What it is | You use it for |
|---|---|---|
| **`BUILD-SPEC.md`** | the client build contract — goal, exact brand (fonts/hex), pages + the §6 block inventory per page, conversion, WP connection | the source of truth for *what* to build |
| **`tokens.css`** | the design-system theme as the shadcn bridge `:root` | **copy into `src/styles/theme.css`** (it drops in — ADR 0012) |
| **`wireframe.html`** | the lo-fi layout reference | the section order + structure per page |

The brand values in `BUILD-SPEC.md` are **locked** — use the fonts/hex EXACTLY, never substitute.

## The build flow (do this, in order)
1. **Ingest** — read `BUILD-SPEC.md` + `wireframe.html`; `cp project-input/tokens.css src/styles/theme.css`; set `site.config.ts` (name, url, nav, footer) + create `.env` from `.env.example` (ask the human for secrets — you cannot write `.env*`).
2. **Per page, in `BUILD-SPEC.md` order** — for each §6 block not already in the registry, run the **`/new-block`** skill (`.claude/skills/new-block/`): the 4-file slice (`wp/acf-fields/<site>-page-blocks.json` → `schema.ts` → `<block>.tsx` → `registry.tsx`) + the index re-export + the **GraphQL wiring** (a `... on Page_Pagefields_Blocks_<Layout>` fragment in `src/lib/cms/queries/page-by-slug.graphql` + a `LAYOUT` entry in `src/lib/cms/adapters/blocks.ts`) + the **seed** (`wp/provision-content.php`, in wireframe order). Then `pnpm codegen`. Optionally add the block to the dev mock fixture (`src/lib/cms/mock/fixtures.ts`) so it renders offline. Compose blocks from **shadcn primitives** (`src/ui/*`) + the semantic tokens.
3. **Copy** — run the **`/copy`** skill: land approved copy into the WP seed + `site.config.ts` (and the dev mock fixture if you keep one).
4. **Verify** — `pnpm codegen && pnpm lint && pnpm typecheck && pnpm build` must pass **without WordPress** (committed schema + dev mock prove it builds offline). Then `./wp/provision.sh` + `pnpm dev` and screenshot with real CMS data.
5. **PR per page** (≤ **400 lines**) — branch `feature/<page>`, commit, open a PR. **CI (lint+typecheck+build) is a required gate — you cannot merge red.** A human reviews + merges.

*(The **build stage** — what `AGENTS.md` governs — reads the synthesised handoff in `/project-input/` and **does not regenerate** the upstream artifacts. The upstream stages that produce them (brief → wireframe → copy → tokens) run **either in-repo today** — drafted in `brief/`/`wireframe/`/`content/` per HQ `workflow/01` — **or via the Hub pipeline** (the target — HQ `workflow/27`), then are synthesised into this handoff. Either way there are no `/brief` or `/wireframe` **build skills** here; the build skills are `/copy` + `/new-block` + the code-reference skills.)*

## How to build a block (the contract — `src/blocks/CLAUDE.md`)
Exactly: `src/blocks/<kebab>/` → `schema.ts` (Zod; ACF field names 1:1; **empty ACF repeater = `false` not `[]` → `z.union([z.array(…), z.literal(false)])`**, empty optional = `null` → `.nullish()`; section blocks add `tone: toneSchema` from `@/lib/tone`) · `<kebab>.tsx` (**Server Component**, props = `z.infer<typeof schema>`, imports `@/ui` only, token utilities only, returns `null` for empty content) · `index.ts` (re-export) · a `defineBlock(schema, dynamic(...))` entry in `registry.tsx` keyed by the ACF layout name. Blocks **never fetch** — they receive validated props.

**GraphQL wiring (two more lines, then `pnpm codegen`):** add an inline fragment to `src/lib/cms/queries/page-by-slug.graphql` — `... on Page_Pagefields_Blocks_<Layout> { … }`, aliasing camelCase WPGraphQL fields back to the schema's snake_case (`cta_label: ctaLabel`) — and a `<Layout> → "<layout>"` entry in the `LAYOUT` map in `src/lib/cms/adapters/blocks.ts` (the map is exhaustive over the union, so codegen + typecheck force you to add it). The renderer still parses `data` against your Zod schema, so field names must match.

**The block's root MUST be `<Section dataBlock="<layout>" tone={tone}>` (`@/ui/section`) — never a raw `<section>`.** `Section` owns the surface (`bg-background text-foreground`), the vertical padding scale (`padding="default|hero|compact"`), the colour-scheme `tone`, and the `Container` — so every block is consistent and tone-capable by construction. This is *how the library stays tight*: section-level concerns live in one primitive, not copy-pasted per block.

## Tokens & components
- **`theme.css` = the per-client BRAND vocabulary** (`--brand-primary`, `--brand-accent`, `--brand-surface(s)`, `--brand-ink(s)`, `--brand-border`, `--brand-error`, radius, fonts) — the handoff `tokens.css` drops in here. **`globals.css` TRANSLATES it to the shadcn bridge** (ADR 0014); that's the only place the brand→shadcn mapping lives. Rebrand = edit `theme.css` only.
- Use **token utilities, never raw hex** (lint-enforced):
  - Brand: `bg-primary` / `text-primary` (CTAs, links), `text-primary-foreground` (on primary).
  - **`bg-brand-accent` / `text-brand-accent`** = the VIBRANT decorative pop (eyebrows, icons, highlights). NOTE: shadcn's `bg-accent` is a *muted hover surface*, not the brand accent.
  - Surfaces/text: `bg-background` `bg-card` `bg-muted` `text-foreground` `text-muted-foreground` `border-border`. Agency aliases also exist: `bg-surface` `text-ink` `text-ink-muted`.
  - **Type scale (token-driven, ADR 0015):** use the type classes — `display-xl` `display-lg` `display-md` `display-sm` (headings), `body-lg` `body` `body-sm` (copy), `label` (uppercase eyebrows). Each sets size + line-height + weight + tracking from the brand tokens. **Don't hand-roll `text-3xl font-bold tracking-tight`** — use a scale step. Shadows (`shadow-card`), section rhythm (`py-section`/`spacing-section`), radius, and motion (transition durations) are all brand-driven too — `theme.css` is the full `--brand-*` contract; `globals.css` translates it.
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

## Data fetching & opt-in modules
- **Server reads** (page/menu/options content) → `graphql-request` at build/server time (`src/lib/cms/`). The default; covers all brochure content.
- **Client reads** (search, faceted filters, live stock/price, member-interactive) → **TanStack Query**, hydrated from a server-fetched payload, fetching through **Server Actions / route handlers — never browser→WP**. Not wired in the base; add `@tanstack/react-query` + a provider only when a site needs it (ADR 0007 §1).
- **Writes** (forms, cart, checkout) → **Server Actions** (the contact block is the example).
- **Regenerate the schema per project** once ACF is defined on real WP: `pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" > src/lib/cms/schema.graphql` then `pnpm codegen`; commit both. The committed baseline is a starting point — replace it.
- **Auth / member-only content** → **WPGraphQL-JWT** (no REST; ADR 0013). Gated content is dynamic/uncached. Opt-in, not in the base — verify the plugin vs WPGraphQL 2.x before the first login site (HQ `workflow/28` Step 10).
- **Commerce** → **WooCommerce Store API + Cart-Token + Server Actions + Stripe Checkout** (reads via WooGraphQL). A different product with its own go/no-go — opt-in module, not the base (HQ `workflow/14`).

## SEO, redirects & preview (see `docs/seo.md`)
- **Per-page meta/OG/JSON-LD = Yoast (free) via "Add WPGraphQL SEO"** (ADR 0018). The page query
  reads `seo { … }` → a source-agnostic `PageSeo` → `pageMetadata()` builds Next `Metadata`;
  Yoast's `schema.raw` is injected by `<SeoSchema>`. Use `pageMetadata(page, path)` in every
  content route's `generateMetadata` — don't hand-roll meta. `provision.sh` installs Yoast +
  `add-wpgraphql-seo`; set WP `home` to the frontend origin so canonical/OG/schema use it.
- **Sitemap** (`app/sitemap.ts`) covers pages **and** posts. **robots.ts** blocks non-production.
  Yoast's own sitemap is killed by `wp/mu-plugins/pod-yoast-headless.php`.
- **Redirects** (`docs/seo.md §Redirects`): `redirects.json` (migration map) + optional
  `WP_REDIRECTS_URL` (the WP "301 Redirects" plugin via `pod-redirects-export.php`) → merged into
  `next.config.ts redirects()`. Free Yoast has no redirect manager → enforce at the edge.
- **Draft preview** (`docs/preview.md`): `/api/preview` scaffold + `getPage({preview})`. **GEO**:
  `/llms.txt`, FAQ-block FAQPage JSON-LD, answer-first E-E-A-T blocks; submit the sitemap to Bing.
- **Images:** ACF image = a connection edge → `image { node { … } }` + flatten (`docs/images.md`).

## Gotchas (earned — see CLAUDE.md for more)
- **`WPGRAPHQL_URL` is the data endpoint** (e.g. `http://localhost:{{WP_PORT}}/graphql`). Unset (or `CMS_MODE=mock`) → the dev mock renders blocks offline. There is **no REST `/wp-json` content path** (ADR 0013).
- **ACF empty repeater/flex** — comes back typed via GraphQL (`null`, not `false`); the schemas already tolerate both (`.nullish()`). Don't assume `[]`.
- **Never edit ACF field groups in wp-admin** — they're code (`wp/acf-export.json` + the mu-plugin); edits won't persist. After changing fields, **regenerate `schema.graphql` + `pnpm codegen`**.
- **Seed ↔ copy parity** — when a block/copy lands, update `wp/provision-content.php` and the copy doc together, in wireframe order. (No `fallback.ts` — the dev mock fixture is optional and dev-only.)
- **Stale `.next`** → `rm -rf .next`. **Local WP reset** → `docker compose down -v && ./wp/provision.sh`. **Inspect GraphQL** → open `"$WP_BASE_URL/graphql"` in GraphiQL, or `pnpm dlx get-graphql-schema "$WPGRAPHQL_URL"`.
- **One `priority` image per page**; `sizes` on every `<Image>`; never `loading="lazy"` above the fold.

## The non-negotiable gates (every page, before the PR)
1. `pnpm lint && typecheck && build` green **without WordPress**.
2. **Every standard in `docs/standards.md`** for the blocks you built — heading weight ≥700, `max-width:65ch`, focus ring on every interactive, labels on inputs, `prefers-reduced-motion`, container `px-4 md:px-8 lg:px-16`, 44px touch targets, one `<h1>`, `next/font`, tagged `fetch`, no raw hex.
3. Brand used **exactly** (fonts/hex from `BUILD-SPEC.md`).
4. Mobile-first verified at 375px.
5. PR ≤ 400 lines, one per page, human-reviewed.

> If you build a block that ships with a standards violation, that's a process failure — fix it in
> the same session, don't defer it. The CI gate + `docs/standards.md` are the contract.
