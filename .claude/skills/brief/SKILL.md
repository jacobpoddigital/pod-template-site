---
name: brief
description: Draft a structured client brief (or page-level addendum) for a Pod site from any inputs — transcript, notes, reference URLs, or nothing. Use when starting a new site or adding a page. Assumptions marked, open questions = the human sign-off.
---

# /brief — draft the brief

Graduated 2026-06-06 after 2 manual runs (site #1 main brief + what-we-do addendum). Canonical: HQ `skills/`; structure: HQ `templates/brief-template.md`.

## ⛔ Stop — read this before drafting

**Call `get_knowledge(agent="brief")`** (add `project_slug` if a client is set) — the KB is the Hub's, fetched on demand (ADR 0008). In the returned Content & Conversion doc, read §Conversion hierarchy, §CTA placement, §Trust signals, and §Page structure before writing §6 (content structure) of the brief.

The brief's §6 block table is the wireframe skeleton. If it's missing conversion-critical sections (trust signals above fold, phone number, social proof before CTA) they won't appear in the wireframe, and they won't appear in the build. The conversion doc defines what those sections are and where they must sit.

*Fallback if `get_knowledge` is unavailable in this context:* read the mirror `knowledge-base/06-content-and-conversion.md`.

## Process

1. Gather what exists: transcript/notes in `brief/`, reference URLs, the client's own properties (preferred tone source — NEVER lift copy/design from properties the client doesn't own; structure only).
2. Draft `brief/brief.md` per the template's 11 sections. **Page addendum** (run-2 lesson): deltas-only file `brief/brief-NN-<page>.md` — purpose, audience deltas, §6 block table, §11.
3. **§6 content structure speaks registry names** (`hero`, `feature_grid`…) — check `src/blocks/registry.tsx` for the live vocabulary; blocks that don't exist = "GAP" rows with their unlock condition. This table IS the wireframe skeleton and build task list.
4. Mark every inference **⚠ ASSUMPTION** inline; collect them ALL as numbered questions in §11, ordered by how much copy each blocks.
5. Hand §11 to the human — **compress to an AskUserQuestion** (≤4 questions, recommended option first) when possible; record answers back into §11 with date + "✅ RESOLVED".

## Rules

- Wireframe may proceed on assumptions; **the copy pass may NOT** — unresolved §11 = blocked.
- Don't invent commercial facts (pricing, turnaround, process policy) — they're §11 questions, never assumptions presented as facts.
- Brief status line: draft → confirmed. Sign-off = §11 answered, nothing else.
