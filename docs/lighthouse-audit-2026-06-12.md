# Lighthouse audit — `/blocks` — 2026-06-12

> 📋 **Template-development record — dated snapshot, not a per-client build step.** A point-in-time Lighthouse run on the template's `/blocks` gallery. Findings were fixed; the durable rules live in `docs/standards.md §11` + `docs/performance.md`. Safe to ignore (or delete) in a client clone. *(Its source PDF was retired from HQ.)*

Source: `input/lighthouse report - nextjs blocks.pdf` (HQ repo). Lighthouse 13.2.0,
Emulated Desktop, captured 2026-06-12 06:17 against `http://localhost:3000/blocks`.

## Scores (as reported)

| Category | Score |
|---|---|
| Performance | 85 |
| Accessibility | 87 |
| Best Practices | 92 |
| SEO | 54 |

## Reading the report: signal vs noise

**This was a dev build in a Chrome profile full of extensions.** Lighthouse itself
warns at the top ("stored data … IndexedDB … audit in an incognito window"). Before
acting on anything, discount the large class of findings that are artefacts of *how
it was run*, not our code:

- **Chrome extensions** — Keeper Password Manager (1,236 KiB), Free VPN VeePN
  (420 KiB), Loom, Wappalyzer, etc. These dominate "Reduce unused JS (1,701 KiB)",
  "3rd parties", "Minify JS", main-thread time, and the bfcache/console noise. All
  0 KiB transfer = injected by extensions. **Not ours.**
- **Dev-mode Next.js** — `next-devtools`, dev React DOM, missing source maps, HMR
  WebSocket (the "bfcache blocked — WebSocket" + the hydration-mismatch console error
  stack with `HotReload`), "Legacy JavaScript", "Server responded slowly 662 ms".
  All disappear in `next build`. **Not representative.**
- **Localhost SEO** — "robots.txt is not valid" (none on localhost) and most of the
  SEO score collapse are environmental, not content bugs (see SEO section below).

Core Web Vitals were actually **good even in dev**: FCP 0.5s, LCP 0.6s, CLS **0**,
TBT 200ms. A production build behind Vercel would score materially higher across
Performance / Best Practices / SEO without us touching a line.

What's left after triage is a **small set of real accessibility bugs in our template
code** — and because every client site inherits the template, those are the high-value
fixes. The to-do list below is scoped to **only what is genuinely ours to fix.**

---

## To-do — confirmed real, in our code (priority order)

### A11y — must fix (template-wide impact)

- [x] **1. Sticky mobile CTA: `aria-hidden` wraps focusable links** — `src/ui/sticky-cta.tsx` — **DONE** (`inert={!shown}` added; standards §11 + qa-blocks updated)
  - Audit: *"[aria-hidden="true"] elements contain focusable descendents"* — failing
    `div.fixed.inset-x-0.bottom-0…backdrop-blur.lg:hidden` containing the Call/CTA links.
  - Cause: when not scrolled past 600px we set `aria-hidden={!shown}` but the bar is only
    translated off-screen (`translate-y-full`) — its `<a>`/`<Link>` stay in the tab order,
    so a keyboard/SR user can focus links inside an `aria-hidden` region.
  - Fix: when hidden, also remove the links from focus order — `inert` on the container
    (or `tabIndex={-1}` + `pointer-events-none` while `!shown`). Prefer `inert` (Baseline)
    which covers focus + AT in one. Keep `aria-hidden` in sync.
  - **Encode:** this is a reusable rule (hidden-but-present interactive regions) → add to
    `docs/standards.md §11` and the `/qa-blocks` lens set.

- [x] **2. Pricing billing toggle: dangling `aria-controls` (invalid ARIA value)** — `src/blocks/pricing/pricing-plans.tsx` — **DONE** (replaced Radix Tabs with a `role="radiogroup"` `BillingToggle`, arrow-key roving focus; standards §11 + qa-blocks updated)
  - Audit: *"[aria-*] attributes do not have valid values"* — failing
    `button#radix-…-trigger-monthly` (the Monthly/Annual toggle).
  - Cause: we use Radix **`Tabs`** purely as a segmented toggle with **no `TabsContent`**.
    Radix puts `aria-controls="<panel-id>"` on each trigger, but the panel never renders →
    `aria-controls` points at a non-existent id = invalid value.
  - Fix options: (a) render a visually-hidden `TabsContent` per value so the ids resolve, or
    (b) replace Tabs with a proper **radiogroup** segmented control (two buttons, `role="radio"`,
    `aria-checked`) — semantically correct for "pick one billing period" and no dangling refs.
    **Recommend (b).** Re-evaluate any other `Tabs`-without-content usages.
  - **Encode:** "don't use Radix Tabs without TabsContent" → standards §11 + qa-blocks.

- [x] **3. Malformed `<dl>` structure** — `src/blocks/stats-band/stats-band.tsx` **and** `src/blocks/stat-with-source/stat-with-source.tsx` (both offenders; the report's `p.mt-1…` node was stat-with-source) — **DONE** (both now plain `<ul role="list">` with `<p>` value/label/note; standards §11 + qa-blocks updated)
  - Audit: *"<dl>'s do not contain only properly-ordered <dt> and <dd> groups"* — failing a
    `dl.grid…lg:grid-cols-3` with a `<p>` child.
  - Cause(s): (i) we render **`<dd>` before `<dt>`** (reversed — a group must be term `<dt>`
    *then* description `<dd>`), and (ii) the optional `<p>` description sits inside the group,
    which isn't `<dt>`/`<dd>`.
  - Fix: emit `<dt>` (label) then `<dd>` (value) inside each `<div>` group; move the
    description into the `<dd>` (or drop the `<dl>` for a plain grid if the term/description
    pairing isn't semantically a definition list). Keep the visual order via CSS, not DOM order.
  - **Verify first:** grep `<dl` across `src/blocks` — confirm stats-band is the only offender
    (the report's failing node was `p.mt-1…`; our stats `<p>` is `mt-2`, so check there isn't a
    *second* `<dl>` block, e.g. FAQ/feature list).
  - **Encode:** dl term/description ordering → standards §11 + qa-blocks.

- [~] **4. Button/link contrast below AA** — **DESCOPED (2026-06-12, owner decision):** colour/contrast
  of button variants is at the developer's discretion per client brand, not a fixed template concern.
  Left to the per-site build. *(original analysis retained below for reference)*
  - Audit: *"Background and foreground colors do not have a sufficient contrast ratio"* —
    multiple failing `a` / `button.inline-flex…rounded-md.font-semibold` (our Button/ButtonLink).
  - Cause: unknown until reproduced — likely one tone/variant (outline/ghost/secondary, or a
    button on a tinted `tone` section) where fg/bg pairing dips under 4.5:1.
  - Fix: identify the failing variant(s) on `/blocks`, adjust the token pairing in
    `src/ui/button-link.tsx` (or the `tone` surface tokens) until ≥4.5:1. Re-run contrast.
  - **Encode:** if a token pair was wrong, fix at the token layer so every consumer inherits it.

### SEO — verify one real item, rest is environmental

- [x] **5. Canonical points to root, not the page** — **VERIFIED, no defect.** Real content pages
  set per-page canonicals correctly (`src/app/[...slug]/page.tsx` → `alternates.canonical =
  "/" + slug.join("/")`). Only the `/blocks` style guide inherits the layout default
  (`canonical: "/"`), and it is intentionally noindex — so the audit flag is environmental,
  not a content bug. No change.
- [ ] *(No-fix, document only)* SEO 54 is otherwise environmental: **"Page is blocked from
  indexing" (meta noindex)** is **correct** for the `/blocks` dev style guide, and
  **"robots.txt not valid"** is just localhost having none. Neither is a defect. Confirm prod
  content pages are *not* noindex.

### Production hardening — not a localhost defect, but track for deploy

- [ ] **6. Security headers** (Best Practices "Trust & Safety", all High, all "no header found"):
  CSP (XSS), HSTS, COOP, X-Frame-Options/`frame-ancestors`, Trusted Types. These are
  **deployment-layer** (Vercel / `next.config` `headers()`), absent on localhost by definition.
  Decide the baseline header set for client sites and encode it in the template's
  `next.config` + a workflow doc. **Not part of the a11y fix branch.**

### Performance — minor, mostly evaporates in prod

- [ ] *(Optional)* **Image `width`/`height`** — audit flags missing explicit dimensions
  (CLS-relevant). CLS was already **0**, so low priority; confirm all `/blocks` sample imagery
  uses `next/image` (or explicit w/h) and that the pravatar demo images aren't the only offenders.
- [ ] *(Optional)* **Font in critical path** — `geist-latin.woff2` on the critical path; consider
  `display: swap` / preload via `next/font`. Marginal; verify against a prod trace first.

---

## Out of scope (noise — do NOT chase)

Reduce/minify/legacy JS · 3rd-party main-thread time · missing source maps · bfcache
WebSocket · hydration-mismatch console error (dev HMR) · "server responded slowly" ·
robots.txt on localhost · IndexedDB stored data. All are dev-mode or extension artefacts.

## Next step after this doc

Re-confirm #4's failing variant and #3's exact `<dl>` set, then fix #1–#4 on a single
`fix/a11y-lighthouse-audit` branch, re-run Lighthouse **in incognito on a `next build`**
to get a clean baseline, update `docs/standards.md §11` + `/qa-blocks`, and open a PR
(human-reviewed — no self-merge). #5 verified separately; #6 tracked for the deploy workstream.
