# Accessibility — standard, enforcement & statement

**Why this is in scope:** our sites are mostly UK (the **Equality Act 2010** makes accessible
services a legal duty — no formal statement mandated, but conformance is) and **e-commerce is
coming**, which brings the **European Accessibility Act** (EAA, in force 28 Jun 2025) for any
service offered to EU consumers — that *does* require WCAG-level conformance + a published
accessibility statement. Source: `web-ai-automation/research/2026-06-13-build-gap-analysis.md` §1–2.

## Target & how we enforce it (not just document it)

- **Target: WCAG 2.2 AA.** The design system already bakes in the mechanics (focus-visible rings,
  44px targets, heading order, labelled landmarks/nav, `prefers-reduced-motion`, contrast,
  semantic lists) — see `docs/standards.md`/KB.
- **Enforced, not aspirational:** `pnpm a11y` runs **pa11y-ci with the axe runner** (axe-core,
  WCAG2AA) against built client pages. `.pa11yci` lists the routes; the CI job is pasted by a
  human (agency policy). It's a **pre-launch, per-client gate run brand- + content-complete**
  (like `pnpm links`) — **not a per-PR blocker** — because contrast depends on the client's real
  brand tokens, not the template's placeholders.
- **Known on the placeholder brand (the gate working as intended):** axe flags `color-contrast`
  on `bg-primary` + `text-primary-foreground` (the default primary vs its ink is < 4.5:1). This is
  exactly what the **apply-brand / design pass must clear per client** — when real brand tokens
  land, re-run `pnpm a11y` and drive it to **zero errors**. The blog/structural routes are
  otherwise axe-clean. (Dev-only `/styleguide` is excluded — it showcases bare components.)
- Manual pass still required for what axe can't catch (keyboard traps, focus order, meaningful
  alt text, content clarity) — axe catches ~30–40% of issues.

## Accessibility statement (template — publish at `/accessibility` per client)

> **Accessibility statement for {Client Name}**
>
> We want everyone to be able to use {site}. We aim to meet **WCAG 2.1/2.2 level AA**.
>
> **How accessible this site is.** {State known limitations, or "We believe this site is fully
> conformant with WCAG 2.2 AA."}
>
> **Feedback & contact.** If you find an accessibility problem or need content in another format,
> email **{accessibility@client}** / call **{phone}**. We aim to respond within {N} working days.
>
> **Enforcement.** UK: if you're not happy with our response, contact the **Equality Advisory and
> Support Service (EASS)**. EU consumers: {national EAA enforcement body}.
>
> **How we test.** Automated testing with axe/pa11y on every release, plus manual keyboard and
> screen-reader checks. Last reviewed: {date}.

Drop the filled statement into a WP page at `/accessibility` and link it in the footer.

## Per-client go-live gate

- `pnpm a11y` passes (or thresholded with the list above).
- The accessibility statement is published at `/accessibility` and linked in the footer.
- For EU-facing/ecom clients: confirm the statement names the EU enforcement body.
