---
name: copy
description: Write conversion copy for a Pod site page from a CONFIRMED brief (§11 resolved) — objection-mapped, numbers-over-adjectives, human picks the headline. Use after the wireframe review, never on unresolved assumptions.
---

# /copy — conversion copy pass

Graduated 2026-06-06 after 2 manual runs (copy-01 home, copy-02 what-we-do). Evidence base: HQ `research/2026-06-06-prompting-for-design-and-copy.md` §(a)Q2, §(b)2.

## Pre-flight

Brief §11 must be ✅ RESOLVED — copy on guessed positioning is rework, not progress. Classify audience awareness (problem/solution/product-aware) from the brief; it sets the hero angle.

## Write `content/copy-NN.md`

1. **Voice**: anchor with 2–3 passages from the client's own properties (multishot) — never adjectives. Direct-response posture: write to one person, plain words, enter the conversation already in their head.
2. **Budgets** (also the fluff filter): headline ≤8 words · subhead ≤20 · card body ≤160 chars · CTA 2–4 words verb-first.
3. **Every claim carries a number, mechanism, or concrete instance** — missing fact → `[NEEDS CLIENT DATA: what]`, NEVER invented. Specific beats round.
4. **Banned**: delve, leverage, unlock, elevate, seamless, robust, comprehensive, game-changer, cutting-edge, "in today's…", rhetorical-question openers.
5. **Output**: 4–5 headline options with one-line rationale + recommendation · copy as JSON keyed by block/field · **objection map** (every brief §3 objection → the section/sentence answering it; unanswered = incomplete) · NEEDS-DATA list.

## Human pick + land it

- **Seed provisionally with the recommended headline**, then AskUserQuestion for the pick (run-2 lesson: zero round-trip cost when they confirm the recommendation; one small edit when they don't). Record the pick in the doc header.
- Land the copy in ALL homes, same order as the approved wireframe: WP seed (`wp/provision-content.php`), fallbacks (`src/lib/cms/fallback.ts`), `site.config.ts` description if page-1. `content/copy-NN.md` is the source of truth the others mirror.
- Verify: re-provision → build (no fallback warning) → screenshot.
