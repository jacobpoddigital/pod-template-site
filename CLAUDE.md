# CLAUDE.md — {{CLIENT_NAME}} ({{REPO_NAME}})

Client site built on the Pod Digital framework. Headless WordPress + Next.js App Router + TypeScript + Tailwind v4. Deployed on Vercel.

> TEMPLATE: replace {{CLIENT_NAME}} / {{REPO_NAME}}, fill in `site.config.ts`, `src/styles/theme.css`, and `src/app/layout.tsx` (typeface), then delete this line.

## Commands

- `pnpm dev` — run locally (works with NO WordPress: fallback content renders)
- `WP_PORT={{WP_PORT}} ACF_PRO_ZIP=<path> bash wp/provision.sh` — full local WP from zero (Docker), idempotent
- `pnpm lint && pnpm typecheck && pnpm build` — must pass before any PR
- Node 22 / pnpm 10.12.1 (pinned via `.nvmrc` and `packageManager` in `package.json`)

## Architecture (do not deviate — lint-enforced)

- **Blocks pattern**: pages render CMS sections via `src/blocks/registry.tsx` + `<BlockRenderer>`. Adding a block = `/new-block` skill (creates 3 files + registers here). See `src/blocks/CLAUDE.md`.
- **Layers**: `ui/` (primitives, zero CMS knowledge) ← `blocks/` / `layout/` ← `app/` (thin composition only). `lib/cms/index.ts` is the only importable CMS module.
- **All WP calls** go through `wpFetch()` (`src/lib/cms/wordpress/fetch.ts`). Zod validation is two-stage: envelope in `lib/cms`, per-block fields in `<BlockRenderer>`.
- **Rendering**: SSG/ISR only for public pages (`export const dynamic = "error"`). Never SSR content pages. Never page-level `"use client"`.
- **Styling**: semantic tokens only (`bg-accent`, `rounded-card` — never raw palette values). Per-client files: `src/styles/theme.css`, `site.config.ts`, `src/app/layout.tsx` (typeface). Nothing else.

## KB gates — mandatory before build work

| Task | Read before starting |
|---|---|
| Any block | KB 01, KB 02, KB 03, KB 09 |
| Form block | Above + KB 05 |
| Hero / pricing / CTA | Above + KB 06 |
| Motion, hover, transitions | KB 02 |
| WordPress data layer, ISR, caching | KB 04 |
| QA / accessibility audit | KB 05 |
| Responsive layout, mobile, grid | KB 09 |

KB docs live in the HQ repo: `web-ai-automation/knowledge-base/`.

## Gotchas

- **Field groups are code**: loaded from `wp/acf-fields/*.json` by the mu-plugin. NEVER edit field groups in wp-admin — edit JSON + matching zod schema, re-run provision.sh.
- ACF returns `false` (not `[]`) for empty flexible-content/repeater fields — schemas must handle this.
- Canonical/OG/sitemap URLs point at the FRONTEND domain (`site.config.ts#url`), never the WP origin.
- Fallback content (`src/lib/cms/fallback.ts`) must stay schema-valid so `pnpm build` passes without WP.
- WP unreachable → fallback (build succeeds); WP returns malformed content → zod throws (build fails). This asymmetry is deliberate.
- Stale `.next` after config changes → `rm -rf .next` then restart.
- One `priority` image max per page (the hero).
- Branch off `main`; agents never push to `main`; PRs ≤ ~400 lines.
- `id="main-content"` on every `<main>` — the skip link targets it.
- All display text >48px: `clamp()` not fixed size classes (KB 09).
- All transitions: `motion-safe:transition-*` prefix (KB 02).
- All interactive elements: `focus-visible:ring-2` not `focus:` (KB 05).

## Process

The canonical workflow lives in the HQ repo: `web-ai-automation/workflow/`. Pipeline: `brief/` → `wireframe/` → Figma → blocks → copy (`content/`) → standards pass → PR. Session state lives in `PROJECT_PLAN.md` — read it first, every session.
