# pod-template-site

Pod Digital's client-site template — extracted from site #1 (`pod-site-website-navigator`, 2026-06-06). Next.js (App Router, SSG/ISR) + headless WordPress (ACF Pro Flexible Content) + Tailwind v4.

## Start a new client site

1. Create `pod-site-<client-slug>` from this template (GitHub "Use this template" or clone+re-init)
2. Set the four client files: `site.config.ts` · `src/styles/theme.css` · `CLAUDE.md` placeholders · `.claude/settings.json` env `POD_PROJECT_ID`
3. `pnpm install && pnpm dev` → renders placeholder fallbacks immediately
4. Local WP: `ACF_PRO_ZIP=<path> ./wp/provision.sh` (Docker; WP on :8081, admin/admin)
5. Follow workflow/01: brief → wireframe → blocks (`/new-block`) → copy → standards pass → PR

## Quality gates

`pnpm lint && pnpm typecheck && pnpm build` — boundaries, file-size and complexity limits are lint-enforced; build must stay green with NO WordPress running (fallback path = resilience guarantee).

## What's in the box

Blocks pattern (hero, card_grid, process_steps) · `lib/cms` adapter with two-stage zod validation · graceful fallbacks · one-command WP provisioning with fields-as-code (mu-plugin reads `wp/acf-export.json`) · tag-based ISR via `/api/revalidate` · robots/sitemap/JSON-LD/skip-link baseline (workflow/04) · hardened `.claude` (guards, audit, redaction, `/new-block` skill) · CI (lint+typecheck+build).
