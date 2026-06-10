---
name: components
description: The token + component system every UI element obeys — shadcn primitives in src/ui, the theme.css → globals.css brand-token bridge, token-utility-only styling (no raw hex, no arbitrary [--var]), the type-scale classes, and section tones. Read before building or styling any component or block.
---

# components — tokens, shadcn, and the Section system

These rules apply to **every** component and block. Training defaults (raw hex, ad-hoc `text-3xl font-bold`, hand-rolled modals) are wrong here.

## Where components live

- **`src/ui/`** — shadcn/ui primitives + composites, **owned/copied into the repo** (never imported from `node_modules`). One component per file, `forwardRef` + `displayName`, props typed inline. `src/ui/` imports nothing internal except `cn` from `lib/utils`. If a component needs WordPress/ACF data it is **not** a `ui` component — it belongs in `src/blocks/`. Full inventory + rules: `src/ui/CLAUDE.md`.
- **`src/blocks/`** — CMS-driven sections. Each block's root is `<Section>` (below). Adding one is the `/new-block` skill.

## The token bridge (ADR 0014/0015) — three layers, swap-safe

```
src/styles/theme.css        --brand-*  (the per-client brand vocab, in oklch)
        ↓ translated by
src/app/globals.css         :root shadcn vars  +  @theme inline (Tailwind utilities)
        ↓ consumed as
components                  token utilities: bg-primary, text-ink, rounded-card …
```

- **Rebrand a client** → edit `theme.css` only (colours, fonts, type scale, spacing, radius, shadow — all oklch/tokens).
- **Swap the UI library** → edit `globals.css` only (shadcn is a template detail living in the translation layer).
- Components never touch `--brand-*` directly; they use the bridged utilities.

## Styling rules (non-negotiable)

1. **Token utilities ONLY** — `bg-primary`, `text-ink`, `text-ink-muted`, `text-brand-accent`, `bg-brand-accent`, `rounded-card`, `ring-primary`, `border-border`. **Never raw hex. Never arbitrary `[--var]` reads** — `@theme inline` does not emit those as `:root` vars, so `text-[--brand-ink]` resolves to *nothing*. This is convention-enforced, not lint-enforced (see "Enforcement reality") — self-check before commit.
2. **Type scale = semantic classes**, not ad-hoc Tailwind: `display-xl · display-lg · display-md · display-sm · body-lg · body · body-sm · label`. One class = full size·leading·weight·tracking from tokens. Don't write `text-4xl font-bold` for a heading.
3. **brand accent ≠ shadcn accent.** `bg-brand-accent` / `text-brand-accent` = the vibrant decorative pop. shadcn's `accent` (`bg-accent`) = a muted hover surface. They are deliberately different tokens — don't substitute one for the other.
4. **Focus**: never `focus:outline-none` without a visible replacement. A global `:focus-visible` ring exists (`globals.css`); for custom controls use `focus-visible:ring-2 focus-visible:ring-primary`.
5. **Motion**: `motion-safe:transition-*` so `prefers-reduced-motion` is respected. Transition duration/easing are already brand-tokened.
6. **Forms**: `aria-invalid` + `aria-describedby` wired to `<p id="${id}-error" role="alert">`; every input has a `<Label htmlFor>`. Use Radix composites (`dialog`, `accordion`, `sheet`) — never hand-roll a modal.

## Section tones — one attribute re-themes a whole section

`<Section tone="muted|inverted|accent">` flips `data-tone`, which remaps the local surface/foreground/primary tokens (`globals.css` `[data-tone="…"]`). So a block becomes dark or accent-themed **without** any component knowing — it reads the same `bg-background text-foreground` utilities. Don't hardcode dark colours; set the tone.

## The Section primitive

Every block's root is `<Section dataBlock="<layout>" tone={tone}>` from `@/ui/section` — **never a raw `<section>`**. Section owns the surface, the vertical padding scale (`default | hero | compact`), the tone attribute, and the `<Container>` (max-width + horizontal padding). Don't re-declare `bg-…` / `py-…` / `<Container>` yourself — that's how blocks drift apart.

## Tailwind v4 note

No `tailwind.config.ts` — config is `@theme` inside `globals.css`. Don't create a config file.

## Enforcement reality (important)

Token discipline (no raw hex, no `[--var]`) is **currently convention-only** — the eslint config enforces *layer boundaries* and *size/complexity*, but **no rule catches a raw hex value**. Until a `no-restricted-syntax` rule lands, this is on you: grep your diff for `#` colour values and `[--` before committing. Flag any violation you ship as FRICTION.

## Related

`src/ui/CLAUDE.md` (primitive inventory + rules) · `src/blocks/CLAUDE.md` (block slice) · `/new-block` skill · `page-templates` skill (how blocks compose into a page).
