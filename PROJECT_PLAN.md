# Project Plan — {{CLIENT_NAME}}

> Living checklist. Never rewrite — only check off. Add client-specific items inline.
> Session start: read this file, find the first unchecked item, pick up there.
> Session end: check off what was completed, add any newly discovered items.

**Hub slug:** `{{SLUG}}`
**Repo:** `jacobpoddigital/pod-site-{{SLUG}}`

---

## Phase 0 — Prerequisites

- [ ] GitHub repo created (`pod-site-{{SLUG}}`)
- [ ] Project registered in Hub — `PUT /api/projects/{{SLUG}}` with `phase: "prerequisites"`
- [ ] `clients/{{SLUG}}.md` created in HQ repo
- [ ] `PROJECT_PLAN.md` created in client repo (this file)
- [ ] Build agent credentials: fine-grained GitHub PAT + Vercel token in Hub vault
- [ ] Content agent credentials: WP application password in Hub vault
- [ ] Branch protection on `main` — agents open PRs only
- [ ] Hub phase updated to `briefing` — `POST /api/projects/{{SLUG}}/session-end`

---

## Phase 1 — Brief

- [ ] Brief notes / transcript in `brief/`
- [ ] `brief/brief.md` drafted (use `templates/brief-template.md`)
- [ ] §11 open questions reviewed and answered by human
- [ ] Hub phase updated to `wireframe`

---

## Phase 2 — Wireframe

- [ ] `wireframe/wireframe.html` generated — KB 06 + KB 01 + KB 09 gates read first
- [ ] `wireframe/rationale.md` written alongside
- [ ] Human review complete — `wireframe/review-01.md` with APPROVE/CHANGE/KILL per section
- [ ] All CHANGE/KILL verdicts addressed
- [ ] Hub phase updated to `design`

<!-- Add page-specific wireframe items here as scope is confirmed -->

---

## Phase 3 — Design (Figma)

- [ ] FRICTION.md Figma entries read + `memory/figma-conventions.md` + `workflow/11 §Code-to-design`
- [ ] Figma file created — 1440px frames, no auto-layout/components/groups
- [ ] `design/figma-rationale.md` written alongside
- [ ] Human drags file from Drafts into team project (610782935) — manual step
- [ ] Human approval received before build starts
- [ ] Figma file URL recorded in `clients/{{SLUG}}.md`
- [ ] Hub phase updated to `scaffold`

---

## Phase 4 — Scaffold

- [ ] WP local port allocated (check `clients/` for used ports — next available recorded below)
  - **WP port:** _____ | **Next.js port:** _____
- [ ] `docker-compose.yml` set up with allocated ports
- [ ] `wp/provision.sh` configured for this site (WP install, ACF, field groups, seed content)
- [ ] `pnpm dev` + `docker compose up` running cleanly
- [ ] `WORDPRESS_API_URL` in `.env.local` (must include `/wp-json` suffix)
- [ ] WP application password generated via WP-CLI — written to `.env.local`
- [ ] `pnpm build` passes (fallback content renders, no TS errors)
- [ ] Port allocation recorded in `clients/{{SLUG}}.md`
- [ ] Hub phase updated to `build`

---

## Phase 5 — Build

> Add each block/page as a sub-item once scope is confirmed from wireframe.
> KB gates: KB 01 + KB 02 + KB 03 + KB 09 before any block. KB 06 for hero/pricing/CTA. KB 05 for forms.

### Blocks
<!-- Replace with actual block list from wireframe. One checkbox per block. -->
- [ ] `{{BLOCK_1}}`
- [ ] `{{BLOCK_2}}`
- [ ] `{{BLOCK_3}}`

### Pages
<!-- One checkbox per page route -->
- [ ] `/` (home)
- [ ] `{{PAGE_2}}`

### Cross-cutting
- [ ] Skip-to-content link in `app/layout.tsx`
- [ ] `id="main-content"` on `<main>` in all pages
- [ ] Mobile nav (`MobileNavDrawer` slot-bridge) implemented
- [ ] All blocks: `px-4 md:px-8 lg:px-16` container padding
- [ ] All display text >48px: `clamp()` applied (KB 09 table)
- [ ] `pnpm lint && pnpm typecheck` passing
- [ ] Hub phase updated to `review`

---

## Phase 6 — Review

- [ ] All PRs opened with explanations
- [ ] CI passing on all PRs
- [ ] Human reviews and merges all PRs
- [ ] `pnpm build` clean on merged main
- [ ] Hub phase updated to `deployed` (after deploy below)

---

## Phase 7 — Deploy

- [ ] Production WordPress provisioned on Krystal — cPanel account, LiteSpeed `/wp-json/*` excluded
- [ ] ACF fields deployed to production WP (JSON → mu-plugin)
- [ ] Content seeded / migrated to production WP
- [ ] Vercel project created and connected to GitHub repo
- [ ] Production env vars set in Vercel (`WORDPRESS_API_URL`, `WP_APP_USER`, `WP_APP_PASSWORD`, `NEXT_PUBLIC_HUB_URL`, `EMBED_ADMIN_PASSWORD`)
- [ ] Deploy successful — production URL confirmed
- [ ] `clients/{{SLUG}}.md` updated with live URL
- [ ] Hub `wordpress_url` updated to production WP URL
- [ ] Hub `vercel_project` updated
- [ ] Better Stack uptime monitor on production URL
- [ ] Vercel → Slack deploy notifications enabled
- [ ] Edit mode verified — 🔒 button appears, login works
- [ ] Hub phase updated to `deployed`

---

## Phase 8 — Operations

- [ ] PostHog snippet added (cookieless default, ADR 0003)
- [ ] Sentry DSN configured
- [ ] Slack notifications wired (P1/P2/P3 channel split)
- [ ] WordPress DB backup schedule confirmed ON
- [ ] Vercel Instant Rollback tested
- [ ] Hub phase updated to `operations`

---

## Notes
<!-- Freeform. Decisions, gotchas, client preferences discovered during the project. Append don't replace. -->
