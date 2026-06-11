# Block Library Audit — 2026-06-11

A point-in-time audit of the 20 blocks in `src/blocks/*` + the shared `src/ui` primitives, against `docs/standards.md`, `AGENTS.md`, `src/blocks/CLAUDE.md`, and the section_settings contract. Read-only; run by three parallel agents (design/a11y · architecture/contract · correctness/security).

**Use this as a tracking checklist** — tick items as they're fixed.

> **Headline:** the library is well-structured and broadly compliant (full data-layer parity, zero raw hex, `sizes` on every image, no `any` leaks). The highest-impact issues cluster in **three shared `src/ui` primitives** (Button, Card, inputs) — so a few fixes cascade across the whole library. One genuine security gap (unsanitised HTML).

> **Progress (2026-06-11):** the **9 high-confidence items are fixed** (ticked below) — XSS sanitisation (`sanitize-html` in the RichText primitive + post_grid excerpt), the 3 primitive a11y fixes (44px touch targets, `CardTitle`→`h3`, 16px mobile inputs), heading weight ≥700 (`display-sm` token + card titles), the `buildNavTree` cycle guard, map-key collisions, the empty-repeater cleanup, and the contact-form `aria-describedby`. Remaining items need a decision or are larger/lower-priority (notably the **`hero` section_settings-contract** call).

---

## 🔴 Critical

- [x] **Unsanitised WordPress HTML → stored XSS.** `rich_text` + `columns` (via `src/ui/rich-text.tsx`) and `post_grid` (excerpt, `post-grid.tsx`) inject raw WP HTML with `dangerouslySetInnerHTML` and **no sanitisation** anywhere; Zod only checks it's a string, and there's no DOMPurify in `package.json`. Given lower-trust / natural-language editors, an editor can store `<script>`/`onerror`/`javascript:`. **Real, not theoretical.**
  **Fix:** add `isomorphic-dompurify` (prose allowlist: standard tags + `a[href]`, strip `script`/`on*`/`javascript:`) inside the `RichText` primitive (one chokepoint = rich_text + columns) **and** on the `post_grid` excerpt. *(FAQ is NOT exposed — it renders answers as plain text.)*

---

## 🟠 High — these trace to 3 shared primitives (fix once, fixes everywhere)

- [x] **Touch targets < 44px (WCAG 2.5.5).** `src/ui/button.tsx` `sm: h-8` (32px) and `md: h-10` (40px, the default), plus `input.tsx`/`select.tsx`/`textarea.tsx` `h-10`. Cascades to **every CTA and form control in every block**.
  **Fix:** bump `Button md` → `h-11` (44px), `sm` → `h-10`/`min-h-11`; raise form controls to `h-11`.
- [x] **Card titles aren't headings.** `CardTitle` renders a `<div>` (`src/ui/card.tsx`), so `card_grid` / `post_grid` / `feature_grid` have an `h2` section with no real `h3` → broken heading hierarchy.
  **Fix:** render card titles as `<h3>` (e.g. `asChild`, or use a real `<h3>`).
- [x] **Mobile-input zoom.** Form controls are `text-sm` (14px) with no 16px mobile override → iOS zooms on focus (standards §9).
  **Fix:** `text-base md:text-sm` (or `text-[16px]`) on input/select/textarea.

---

## 🟡 Medium

- [x] **Heading weight < 700.** The `display-sm` token is weight **600** (`theme.css --brand-text-display-sm-weight`), and card/item titles use ad-hoc `text-lg font-semibold` (600) instead of a type-scale class. Affects `key_takeaways` (display-sm `h2`) + all card/service titles.
  **Fix:** use a ≥700 type-scale class for titles, or raise the `display-sm` token weight.
- [ ] **`ui/heading.tsx` + `ui/rich-text.tsx` hand-roll the type scale** (`text-4xl font-bold`, `[&_h2]:text-3xl [&_h2]:font-bold`, h3 at 600) — the exact ad-hoc pattern the KB/AGENTS.md forbid.
  **Fix:** map to the token type-scale classes; bump injected `h3`/`strong` to ≥700 where they're headings.
- [x] **`hero` is outside the section_settings contract.** ✅ Resolved — folded into the contract (defaults to the hero padding; editor can now set spacing/container, and a hero can be a `#anchor` target). It imports `toneSchema` directly (not `...sectionSettingsFields`), so it has no `spacing`/`container`/**`anchor`** in schema, SDL, or fragment, and hardcodes `padding="hero"`. Consequence: an editor can't set hero spacing/width, and **a hero can never be an in-page `#anchor` target.** Consistent across surfaces (not drift) — a deliberate gap.
  **Fix:** either fold hero into the contract (spread `sectionSettingsFields`; add spacing/container/anchor to SDL + fragment; apply `sectionProps`, defaulting padding to `hero` when spacing unset) **or** document the exemption in `src/blocks/CLAUDE.md`.
- [x] **`buildNavTree` (`src/lib/cms/index.ts`) has no cycle guard.** A malformed WP menu with a self/looping `parentId` → infinite recursion in `clean()` → build/ISR crash. (Orphaned parentId is handled.)
  **Fix:** skip self-parent (`n.parentId === n.id`) and track a visited set in the recursion.
- [x] **Map-key collisions.** `faq` (`key={i.question}`), `feature_grid` (`key={f.title}`), `logo_strip` (`key={l.name}`) aren't guaranteed unique → reconciliation bugs on duplicate content.
  **Fix:** compound key `${value}-${idx}` (newer blocks like card_grid already do this).
- [x] **Empty-repeater handling inconsistent.** `faq`, `feature_grid`, `logo_strip` use the legacy `z.union([z.array(...), z.literal(false)]).nullish()`; the other 8 use plain `.array().nullish()`. Over WPGraphQL empty repeaters arrive as `null` (the `false` was REST-era), so the newer pattern is correct and the `false` arm is dead.
  **Fix:** drop the `z.literal(false)` arm in the 3 older blocks. (Behaviour unchanged — all guard with `Array.isArray`.)
- [x] **Repeated items aren't semantic lists.** ✅ card_grid / services_grid / feature_grid / reviews grid variants now use `<ul role="list">`/`<li>`. `services_grid` (and the `card_grid`/`feature_grid` card grids) render items as bare `<div>`s; a repeated set should be `<ul>/<li>` (cf. `usp_bar`, `stat_with_source`).
- [ ] **`comparison_table`** uses arbitrary size `min-w-[34rem]` (no-arbitrary-size rule) → use a scale/token width.
- [x] **`contact_form` Topic select** sets `aria-invalid` but no `aria-describedby`, so its `ErrorText` (`#enquiry-err`) is never announced.
- [ ] **`hero` overlay contrast** — `bg-black/50` + `text-white/85` subheading isn't guaranteed AA on a light/busy image. Verify, don't assume; consider a gradient scrim.

---

## 🟢 Low

- [x] **Required `.min(1)` fields throw the page build** ✅ Rule documented in `src/blocks/CLAUDE.md`: any required Zod field must be marked _Required_ in `wp/acf-fields/*.json` so the editor can't publish it blank. (Per-project ACF marking; the rule is the deliverable.) if an editor leaves them blank (`cta_banner.cta_label/url`, `hero.heading`, `media_text.heading`, `video.video_id`, item `.min(1)` fields) — `block-renderer` parse throws, failing build/ISR rather than degrading. Defensible "fail loud" stance, but **mark these fields required in `wp/acf-fields/*.json`** so the CMS enforces pre-publish; note it in `CLAUDE.md`.
- [x] **Dev mock covers only 7 of 20 blocks.** 🚫 Won't do (decision) — the `/blocks` style guide is the canonical layout showcase; the homepage/mock-home is undecided, so it isn't loaded with the full set. `mockHome` exercises hero, logo_strip, feature_grid, faq, contact_form, media_text, cta_banner; the 13 tier-1/E-E-A-T blocks never render offline. Extend `mockHome` (or add a second mock page) so `pnpm dev` smoke-tests the full set.
- [ ] **`stat_with_source`** `<dl>` renders `<dd>` (value) before `<dt>` (label) — valid but reversed reading order.
- [ ] **`reviews`** — no `<cite>` for author attribution (optional).
- [ ] **`contact_form` success** uses `role="status"` rendered on update rather than a pre-mounted live region — SRs may not announce reliably.
- [ ] **CMS `href`s aren't scheme-validated** (`javascript:` in a nav `uri` would pass through `buildNavTree` → `Link`); low risk via `next/link`/React, but no allowlist.
- [ ] **`card_grid` vs `services_grid`** are the closest pair (both image+title+body+link+slider; differ only by Card chrome vs bare div + icon size). Genuinely distinct, but document the intended distinction so they don't drift.

---

## What's solid (confirmed by the audit)

- **Full data-layer parity** across all 20 blocks — registry / SDL union / `LAYOUT` map / query fragments / mock all consistent; no missing types, unmapped members, or alias↔zod-name mismatches.
- **Union response-key hazards correctly defused** (`columns` → `column_items`; key_takeaways uses `points` not `items`).
- **Zero raw hex / arbitrary colour values**; semantic tokens throughout.
- **`sizes` on every `<Image>`**; no below-fold `priority`; no obvious CLS.
- **No `any` leaks**; the `post_grid` async-component cast is sound.
- **Heading *levels*** (h1/h2/h3) consistent; **external-link `rel`** clean; grid blocks genuinely **differentiated, not duplicates**.
- `<Section>`/`<Container>` correctly centralise surface, padding, and measure; only `post_grid` fetches (the sanctioned exception); no stray `"use client"`.

---

## Recommended fix order

1. **XSS sanitisation** (Critical — first).
2. **The 3 primitive fixes** — Button size, `CardTitle`→`h3`, input size + 16px. Highest leverage: ~3 files fix a11y across the whole library.
3. **Correctness guards** — `buildNavTree` cycle guard + map keys (cheap, prevent build crashes).
4. **The rest** — heading-weight tokens, the hero-contract decision, empty-repeater cleanup, semantic lists, the smaller a11y items.

> **Process note (HQ):** the touch-target and heading-weight issues are **KB-gate violations** that the build gate should have caught — worth a `FRICTION.md` line in HQ so the gate/lint is tightened (e.g. lint the type-scale classes + a min-touch-target check).

---

*Audit method: 3 read-only agents over `src/blocks/*` + `src/ui/*` + `src/lib/cms/*`, cross-checked and synthesised. Findings are code-verified, not speculative.*
