# pod-template-site

Pod Digital's client-site template — the **"Great White Pro"** build tier (HQ ADR 0017). Next.js (App Router, SSG/ISR) + headless WordPress via WPGraphQL (ACF Pro Flexible Content) + Tailwind v4 + shadcn/ui, on Vercel.

## 📘 Building sites — start here

- **Developers (the end-to-end workflow):** read **HQ `workflow/31` — Developer Guide: Building a Great White Pro Site**. It covers the whole flow (compose from the block library, the editor section-settings handoff with no rebuild, building bespoke blocks via `/new-block`, review + ship) and how your role works.
- **Claude Code (the in-repo build instructions):** read **`AGENTS.md`** + **`docs/standards.md`** — the by-the-book build recipe and the enforceable standards.
- **The block library + section-settings contract:** HQ `workflow/29`.

## Start a new client site

1. Create `pod-site-<client-slug>` from this template (GitHub "Use this template" or clone+re-init)
2. Set the four client files: `site.config.ts` · `src/styles/theme.css` · `CLAUDE.md` placeholders · `.claude/settings.json` env `POD_PROJECT_ID`
3. `pnpm install && pnpm dev` → renders the dev mock immediately (no WordPress needed — ADR 0013)
4. Local WP: `ACF_PRO_ZIP=<path> ./wp/provision.sh` (Docker; WP on :8081, admin/admin)
5. Follow workflow/01: brief → wireframe → blocks (`/new-block`) → copy → standards pass → PR

## Quality gates

`pnpm lint && pnpm typecheck && pnpm build` — boundaries, file-size and complexity limits are lint-enforced; build must stay green with NO WordPress running (committed `schema.graphql` + dev mock — ADR 0013; **no fallback content**).

## What's in the box

Block library (hero, media_text, card_grid/feature_grid, faq, cta_banner, logo_strip, contact_form, … — growing per HQ workflow/29) composing a shared `<Section>` with the editor-controlled section-settings contract · `lib/cms` WPGraphQL data layer (graphql-request + codegen, committed schema + dev mock — ADR 0013) · one-command WP provisioning with fields-as-code · tag-based ISR via `/api/revalidate` · robots/sitemap(pages+posts)/JSON-LD/skip-link baseline (workflow/04) · **Yoast-driven per-page SEO** (meta/OG/schema via "Add WPGraphQL SEO", ADR 0018 — `docs/seo.md`) · edge **redirects** (`redirects.json` + WP-plugin sync) · **draft-preview** scaffold (`docs/preview.md`) · **GEO** (`/llms.txt` + JSON-LD) · hardened `.claude` (guards, audit, redaction, `/new-block` skill) · CI (lint+typecheck+build).

Build/SEO/ops docs: `docs/standards.md` (the by-the-book rules), `docs/seo.md`, `docs/preview.md`, `docs/images.md`, `docs/measurement-and-consent.md`, `docs/security.md`, `docs/observability.md`, `docs/go-live-checklist.md`.
