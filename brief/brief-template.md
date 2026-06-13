# Brief — {{CLIENT_NAME}}

> Structure established on site #1 (website-navigator, 2026-06-06). Lives in the client repo at `brief/brief.md`. Drafted by Claude from whatever inputs exist (meeting transcript, notes, reference URLs, existing client properties); every unconfirmed inference is marked **⚠ ASSUMPTION** and listed in §11. A human resolves §11 BEFORE the content pass — the wireframe may proceed on assumptions, copy may not.

## 1. Snapshot
Client · project_id/repo · date + status (draft/confirmed) · source materials (transcript? notes? reference URLs? none?)

## 2. Purpose & conversion
Why the site exists (one sentence) · the ONE primary conversion action + mechanism · secondary actions (default: none — protect the primary)

## 3. Audience
Primary audience and their situation · **their top objections — each one must map to a content block answering it** · secondary audiences (acknowledged vs targeted)

## 4. Positioning & message
Value prop in one line · 3–5 proof points · tone of voice with a concrete reference (an existing property of the client's, never a competitor's copy)

## 5. Brand inputs
Name/wordmark · palette + typography (or "token set is fair game") · relationship to parent/sibling brands

## 6. Content structure — blocks speak registry names
Per page: a table of `block_name` → content job. **Use the exact `src/blocks/` registry names**; blocks that don't exist yet are explicitly "post-MVP candidates" with their unlock condition. This table IS the wireframe's skeleton and the build's task list.

## 7. Functionality
Forms, integrations, embeds — each tied to the §2 conversion decision. Default MVP: none.

## 8. SEO & locale
Locale · domain · working title/meta (refined in the workflow/04 pass, not here)

## 9. Out of scope
Explicit exclusions, synced with the repo's SPEC.md.

## 10. Success measures
MVP measure (can be process-quality: "human approves copy without rewriting >50%") · post-launch measures (PostHog per ADR 0003)

## 11. Open questions
Numbered list of every ⚠ ASSUMPTION needing a human answer, ordered by how much copy each one blocks. **This section is the human's review surface — answering it is the brief sign-off.**
