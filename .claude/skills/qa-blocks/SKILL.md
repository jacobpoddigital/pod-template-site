---
name: qa-blocks
description: Adversarial QA of a batch of CMS blocks before merge / before a real client build. Use after /new-block (or a block-library change) and before opening a PR or starting a client build. Runs the automated gates first, then a read-only multi-lens review (a11y · security · correctness · convention-drift) for what gates CAN'T catch, fixes real findings in the same session, and feeds lessons back into docs/standards.md §11. The QA counterpart to /new-block.
---

# /qa-blocks — adversarial QA of a block batch

Extracted 2026-06-11 after the Tier 0–3 expansion (PR #38) shipped 17 blocks that passed lint/build/typecheck but had **not** been through the adversarial pass the original set got. The pass found real issues the automated gates structurally cannot see (an invisible focus ring, an unvalidated id flowing into an iframe URL, a heading-weight misuse, a key collision). This skill makes that pass repeatable. It is the QA counterpart to `/new-block`; **canonical here** in `pod-template-site`, inherited by client repos.

## When to run (and when not to)

- **Run:** before opening a PR for a block batch, or before the first real client build (FRICTION #81 — *audit shipped code with a read-only pass before the first real client build*).
- **Don't run:** on a single trivial edit. This spins up review agents — it's a batch gate, not a per-keystroke check.

## ⛔ First: run the gates. Don't pay agents to re-check what lint enforces.

```
pnpm typecheck && pnpm lint && pnpm build
```

Lint already enforces the type scale (no raw `text-*`), layer boundaries, complexity, file size; the build's craft check enforces `aria-labelledby`/`data-block`/autocomplete. **If these fail, stop and fix — that's not what the agents are for.** Half of a naive 4-agent pass just re-confirms lint; skip that. Agents are for the judgement/logic calls below.

## The lenses — fan out READ-ONLY agents, scoped to the diff

Get the changed blocks first: `git diff --name-only main...HEAD -- src/blocks src/ui src/layout`. Point each agent at *those* files + `docs/standards.md` (§7 a11y, §11 hard rules) + an established passing block (`src/blocks/reviews`, `src/blocks/card-grid`) as the reference. Subagents are read-only here — they return findings; **you fix in the main thread.**

Run these in parallel (one message, multiple Agent calls). Trim the redundant ones for small diffs.

### 1. Accessibility (highest yield — gates can't see contrast or focus management)
- **Focus ring CONTRAST** — on a coloured control (`bg-primary`/`bg-brand-accent`/inverted/announcement bar) a same-hue ring is invisible. Demand `ring-<contrasting-foreground>` + `ring-offset-<that-surface>`. *(This shipped wrong once — sticky-cta.)*
- **Focus management on interactive leaves** — Dialog/lightbox (focus trap + return), tabs, sliders, the range input in before/after, sticky header (does hiding it strand focus?), drawer (Esc + return to trigger). **A region hidden by transform/offset (not unmounted) needs `inert` when hidden** — `aria-hidden` alone leaves its links focusable (off-screen tab stop). *(Shipped wrong once — sticky-cta.)*
- **Radix `Tabs` only for real tab/panel sets** — a `Tabs`/`TabsTrigger` with no matching `TabsContent` leaves a dangling `aria-controls` (invalid ARIA). A "pick one" segmented toggle (monthly/annual) is a `role="radiogroup"` of `role="radio"` buttons. *(Shipped wrong once — pricing.)*
- **Heading element ↔ weight** — a real `<h2>/<h3>` must read as a heading; a `label`-token heading is a bug. Widget labels are `<p className="label">` with the landmark's `aria-label` carrying the name. *(Shipped wrong once — toc.)*
- 44px targets + ≥8px spacing; heading hierarchy (h2 section → h3 item, no skips); list semantics (`<ul role="list">` / `<ol>`); **a `<dl>` holds only term-first `<dt>`/`<dd>` (in `<div>` groups), never a stray `<p>` — if the label is optional or there's an extra line, use `<ul role="list">` not `<dl>`** *(shipped wrong once — stats-band/stat-with-source)*; image alt correctness; icon-only controls named; `prefers-reduced-motion` on everything animated; overlay-text contrast on images.

### 2. Security (untrusted CMS input)
- **Every `dangerouslySetInnerHTML` is `sanitize()`-d on the SERVER** before it reaches a client leaf (trace the path; the client must not receive raw HTML).
- **CMS strings interpolated into a URL or `iframe src` need a FORMAT regex at the schema**, not just `.min(1)` — e.g. a YouTube `video_id` → `/^[A-Za-z0-9_-]{11}$/`. *(Shipped wrong once — video_testimonial.)* Anchor targets go through `toAnchorId()`.
- `target="_blank"` carries `rel="noopener noreferrer"`; Server Actions validate with Zod server-side; no secrets client-side.

### 3. Correctness / logic
- React keys compound + stable (`${field}-${i}`) — a bare CMS string collides. *(Shipped wrong once — social-links on duplicate URLs.)*
- Null/empty: `Array.isArray()` guard + return `null` when empty; optional-chain nested CMS fields; fallbacks (e.g. pricing `price_annual ?? price`, toggle only when an annual price exists).
- Scroll/resize listeners cleaned up; `useSyncExternalStore` / no setState-in-render; SSR/hydration of client leaves.
- **Field-name parity** schema ↔ GraphQL fragment (camelCase→snake_case alias) ↔ component — a mismatch makes a field silently `undefined`. Adapter `LAYOUT` + registry both list every new block. Mock/sample shapes parse against the schema.

### 4. Convention drift vs the originals
- Diff each new block against `reviews`/`card-grid`: Section contract, server-shell/client-leaf slot-bridge, token-only colours, `sectionProps`, `columnsClass`, the heading/intro wrapper. Flag anything that does it differently for no reason.

## Triage — separate real from noise

Known **false alarms** (don't re-raise, don't "fix"):
- Tailwind's bare `transition` utility is a curated property set, **not** CSS `transition: all`.
- `next.config` `remotePatterns` not listing the WP host is a **per-client provisioning step**, not a code bug.
- A `target` that passes through `toAnchorId()` is already URL-safe.

**Pre-existing code** (prior rounds, already audited) is out of scope — log it for a separate sweep, don't fold it into a block-batch PR silently.

## Fix + encode (same session — this is the point)

1. Fix every **real** finding in the main thread; re-run `pnpm typecheck && pnpm lint && pnpm build`.
2. **Append the round to `docs/block-library-audit.md`** — findings, fixes, AND the false alarms (so the next run doesn't re-litigate them).
3. **Encode any NEW recurring rule in `docs/standards.md §11`** — that's the layer that prevents the repeat. If a miss is *mechanisable*, propose a lint rule so this skill shrinks over time (the goal is for the agents to find less each round).
4. HQ: a `FRICTION.md` line for any genuinely new class of miss, "Encoded where" → `standards.md §11`.

The seed checklist above already came from round 2 (2026-06-11, `standards.md §11`). Each run should leave the next run with a shorter list.

## Commit

One `fix(blocks): QA round-N …` commit (fixes + the audit-doc + §11 updates together), then open the PR. Don't merge — human-reviewed (agency rule).
