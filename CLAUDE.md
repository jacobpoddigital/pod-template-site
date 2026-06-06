# CLAUDE.md — {{CLIENT_NAME}} ({{REPO_NAME}})

Client site built on the Pod Digital framework. Headless WordPress + Next.js App Router + TypeScript + Tailwind v4. Deployed on Vercel.

> TEMPLATE: replace {{CLIENT_NAME}}/{{REPO_NAME}}, set `site.config.ts` + `src/styles/theme.css` + `.claude/settings.json` env `POD_PROJECT_ID`, then delete this line.

## Commands

- `pnpm dev` — run locally (works with NO WordPress: fallback content)
- `ACF_PRO_ZIP=<path> ./wp/provision.sh` — full local WP from zero (Docker), idempotent; WP at :8081
- `pnpm lint && pnpm typecheck && pnpm build` — must pass before any PR
- Node 20 / pnpm 10 (pinned via `packageManager`)

## Architecture (do not deviate — lint-enforced)

- **Blocks pattern**: pages render CMS sections via `src/blocks/registry.tsx` + `<BlockRenderer>`. Adding a section = `/new-block` skill (4 files). See `src/blocks/CLAUDE.md`.
- **Layers**: `ui/` (primitives, no CMS knowledge) ← `blocks/`/`layout/` ← `app/` (thin composition ONLY). `lib/cms/index.ts` is the only importable CMS module.
- **All WP calls** go through `wpFetch()` (`src/lib/cms/wordpress/fetch.ts`). zod validation is two-stage: envelope in `lib/cms`, per-block fields in `<BlockRenderer>`.
- **Rendering**: SSG/ISR only for public pages (`export const dynamic = "error"`). Never SSR content pages. Never page-level `"use client"`.
- **Styling**: semantic tokens only (`bg-brand`, `rounded-card` — never raw palette values). Client-specific files: `src/styles/theme.css`, `site.config.ts`, `src/app/` — nothing else.

## Gotchas

- **Field groups are code**: registered from `wp/acf-export.json` by a mu-plugin. NEVER edit field groups in wp-admin (won't persist) — edit the JSON + matching zod schema, re-run `./wp/provision.sh`
- ACF returns `false` (not `[]`) for empty flexible-content/repeater fields — schemas handle this; keep doing it for new blocks
- Canonical/OG/sitemap URLs point at the FRONTEND domain (`site.config.ts#url`), never the WP origin
- Fallback content (`src/lib/cms/fallback.ts`) must stay schema-valid and mirror `content/copy-NN.md`
- WP unreachable → fallback (build succeeds); WP returns *malformed* content → zod throws → build fails. That asymmetry is deliberate, don't "fix" it
- Stale `.next` after config churn → missing CSS / "Client Manifest" errors → `rm -rf .next`, restart
- One `priority` image max per page (the hero)
- Branch off `main`; agents never push to `main`; PRs ≤ ~400 lines

## Process

The canonical workflow lives in the HQ repo: `web-ai-automation/workflow/`. Pipeline: brief (`brief/`) → wireframe (`wireframe/`) → blocks → copy (`content/`) → standards pass → PR.
