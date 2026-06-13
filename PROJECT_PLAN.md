# Project Plan — {{CLIENT_NAME}}

> Living checklist. Never rewrite — only check off. Append new items inline.
> **Session start**: read this file → find first unchecked item → verify with `git log --oneline -10` → state what you found before doing any work.
> **Session end**: check off completed items → commit `chore(plan): check off <what>`.

**Hub slug:** `{{SLUG}}`
**Repo:** `jacobpoddigital/pod-site-{{SLUG}}`

---

## Phase 0 — Project Setup
> Happens at first brief meeting — repo exists from this moment forward.

- [ ] GitHub repo created from template (`pod-site-{{SLUG}}`)
- [ ] Project registered in Hub — `PUT /api/projects/{{SLUG}}` with `phase: "briefing"`
- [ ] `clients/{{SLUG}}.md` created in HQ repo
- [ ] `PROJECT_PLAN.md` copied into client repo (this file) — `{{CLIENT_NAME}}` filled in
- [ ] Branch protection on `main` — agents open PRs only, never push direct
- [ ] **[H] GATE: human confirms repo is live and Hub shows the project**

---

## Phase 1 — Brief

- [ ] Brief notes / meeting recording placed in `brief/`
- [ ] `brief/brief.md` drafted by agent — inferences marked ⚠ ASSUMPTION
- [ ] §11 open questions sent to client for answers
- [ ] **[H] GATE: human confirms §11 answers received — wireframe may NOT start until this is done**
- [ ] Hub phase → `wireframe` — `POST /api/projects/{{SLUG}}/session-end`

---

## Phase 2 — Wireframe

- [ ] KB 06, KB 01, KB 09 read before starting
- [ ] `wireframe/wireframe.html` generated — real copy, real palette, no lorem ipsum
- [ ] `wireframe/rationale.md` written alongside (design decisions, block choices, copy direction)
- [ ] **[H] GATE: human reviews wireframe + rationale — records APPROVE / CHANGE / KILL per section**
- [ ] All CHANGE / KILL verdicts addressed
- [ ] Hub phase → `design`

<!-- Add page-specific wireframe items here once scope is confirmed -->

---

## Phase 3 — Design (Figma)

- [ ] FRICTION.md Figma entries read + `memory/figma-conventions.md` + `workflow/11 §Code-to-design`
- [ ] Figma file created — 1440px frames, no auto-layout / components / groups
- [ ] `design/figma-rationale.md` written alongside
- [ ] **[H] GATE: human drags file from Drafts into team project (610782935) — manual, agent cannot do this**
- [ ] **[H] GATE: human approves design — build may NOT start until approved**
- [ ] Figma file URL recorded in `clients/{{SLUG}}.md`
- [ ] Hub phase → `scaffold`

---

## Phase 4 — Scaffold

- [ ] WP port allocated — check `clients/` for used ports
  - **WP port:** _____ | **Next.js port:** _____
- [ ] TEMPLATE vars in `docker-compose.yml`, `wp/provision.sh`, `site.config.ts` filled in
- [ ] `src/styles/theme.css` — client brand tokens set
- [ ] `src/app/layout.tsx` — client typeface loaded
- [ ] `wp/acf-fields/` — field group JSON created for this site (site-prefixed keys: `group_{{SLUG}}_*`)
- [ ] `docker compose up -d && bash wp/provision.sh` runs cleanly
- [ ] `WORDPRESS_API_URL=http://localhost:{{WP_PORT}}/wp-json` in `.env.local`
- [ ] WP application password generated: `docker compose run --rm --user root --entrypoint bash cli -c "wp --allow-root --path=/var/www/html user application-password create admin claude-desktop --porcelain"`
- [ ] `pnpm build` passes (fallback content renders, no TS errors)
- [ ] Port allocation recorded in `clients/{{SLUG}}.md`
- [ ] **[H] GATE: human confirms local dev runs and pushes initial scaffold commit to `main`**
- [ ] Hub phase → `build`

---

## Phase 5 — Build

> Fill in the block and page lists from the approved wireframe before starting any build work.
> KB gates: KB 01 + KB 02 + KB 03 + KB 09 before any block. KB 06 for hero/pricing/CTA. KB 05 for forms.

### Blocks
<!-- One checkbox per block, added from wireframe scope -->
- [ ] `{{BLOCK_1}}`
- [ ] `{{BLOCK_2}}`

### Pages
<!-- One checkbox per route -->
- [ ] `/` (home)
- [ ] `{{PAGE_2}}`

### Cross-cutting
- [ ] Skip-to-content link + `id="main-content"` on all `<main>` elements
- [ ] `MobileNavDrawer` slot-bridge implemented
- [ ] All blocks: `px-4 md:px-8 lg:px-16` container padding (KB 09)
- [ ] All display text >48px: `clamp()` applied (KB 09)
- [ ] All transitions: `motion-safe:transition-*` (KB 02)
- [ ] All interactive elements: `focus-visible:ring-2` (KB 05)
- [ ] `pnpm lint && pnpm typecheck` passing
- [ ] Hub phase → `review`

---

## Phase 6 — Review

- [ ] All PRs opened (≤400 lines each) with explanations
- [ ] CI passing on all PRs
- [ ] **[H] GATE: human reviews and merges all PRs — no agent self-merge**
- [ ] `pnpm build` clean on merged main

---

## Phase 7 — Deploy

- [ ] Production headless WordPress provisioned (WP Engine Atlas, ADR 0006) — WPGraphQL endpoint
- [ ] ACF fields deployed to production WP (JSON → mu-plugin)
- [ ] Content seeded / migrated to production WP
- [ ] Vercel project created and connected to GitHub repo
- [ ] Production env vars set in Vercel (`WPGRAPHQL_URL`, `WP_APP_USER`, `WP_APP_PASSWORD`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_HUB_URL`, `EMBED_ADMIN_PASSWORD`; measurement/monitoring vars as they activate)
- [ ] Deploy successful — production URL confirmed
- [ ] `clients/{{SLUG}}.md` updated with live URL
- [ ] Hub `wordpress_url` + `vercel_project` updated
- [ ] Better Stack uptime monitor on production URL
- [ ] Vercel → Slack deploy notifications enabled
- [ ] Edit mode verified — 🔒 button appears, login works
- [ ] **GATE: go-live checklist (`docs/go-live-checklist.md`) all-green + `/security-review` run** — every box ticked or waived in writing; CSP flipped to `CSP_MODE=enforce` with a clean report console (`docs/security.md`)
- [ ] **[H] GATE: human sign-off that site is live and correct**
- [ ] Hub phase → `deployed`

---

## Phase 8 — Operations

- [ ] PostHog snippet added (cookieless default, ADR 0003)
- [ ] Sentry DSN configured
- [ ] Slack notifications wired (P1/P2/P3 channel split)
- [ ] WordPress DB backup schedule confirmed ON
- [ ] Vercel Instant Rollback tested
- [ ] Hub phase → `operations`

---

## Notes
<!-- Freeform. Decisions, gotchas, client preferences discovered during the project. Append — never replace. -->
