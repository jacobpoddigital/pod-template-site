---
name: wireframe
description: Generate a lo-fi annotated HTML wireframe from a confirmed-or-draft brief for a Pod site page. Use after /brief, before any build. Grayscale, plan-first, GAPS flagged — the human's per-section veto surface.
---

# /wireframe — lo-fi wireframe + review

Graduated 2026-06-06 after 2 manual runs (home, what-we-do). Evidence base: HQ `research/2026-06-06-prompting-for-design-and-copy.md` §(a)Q1, §(b)1.

## Generate (one self-contained HTML file in `wireframe/<page>.html`)

1. **Plan first** — HTML comment at top: per-section table of block · brief citation · purpose. A section that cites nothing in the brief is banned (that's the structural-slop filter).
2. **Fidelity contract** (state it in the file): grayscale only (#fff/#f5f5f5/#ddd/#999/#333), system font, no brand styling. Real headline-level copy from the brief; placeholder body. Media = labelled gray boxes.
3. **Compose ONLY from registry blocks** (`src/blocks/registry.tsx`); needs no block supports → dashed **GAP** section with the scope question, never an invented design.
4. Layout: one 1440px desktop frame; grid with a 360px right column of **numbered annotations** — per section: block type, why (brief citation), objection addressed, mobile behaviour.
5. Close with an HTML comment of open questions (page-order alternatives, scope calls).

## Review (the human rung)

- Record verdicts in `wireframe/review-NN.md`: **APPROVE / CHANGE / KILL / QUESTION** per section number.
- Run-2 lesson: compress the review to an **AskUserQuestion** (≤4 decisive questions: scope GAPs, claims, identity calls) — 4 taps beats a meeting. Defaults the human didn't override get noted as "default accepted".
- GAP approved to build → it's a `/new-block` job; cite the review line in the commit.
