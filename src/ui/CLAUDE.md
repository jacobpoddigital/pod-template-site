# src/ui/ — Primitive & Composite Component Library

No component here imports from `src/blocks/` or knows about CMS data shapes. If a component needs WordPress/ACF data, it belongs in `src/blocks/`.

Semantic tokens only (`--color-accent`, `--color-ink`, `--radius-card`) — never raw hex or palette values. One component per file, props typed inline.

## Primitives

| File | What it is |
|---|---|
| `button.tsx` | CVA Button — `primary / secondary / ghost / destructive / outline` variants; `sm / md / lg / icon` sizes; `asChild` via Radix Slot |
| `button-link.tsx` | Next.js `<Link>` styled as a button via `buttonVariants` — use for CTAs that navigate |
| `input.tsx` | Text input with `forwardRef`, `aria-invalid`, `aria-describedby` error wiring |
| `textarea.tsx` | Same pattern as Input with `resize-y` |
| `label.tsx` | Radix Label with `required` prop (renders `*`) |
| `badge.tsx` | CVA Badge — `default / outline / success / warning / error / muted` |
| `checkbox.tsx` | Radix Checkbox — always pair with `<Label htmlFor={id}>` |
| `skeleton.tsx` | `animate-pulse` placeholder — `aria-hidden`, shape via className |
| `separator.tsx` | Radix Separator — horizontal/vertical, decorative by default |
| `container.tsx` | Max-width wrapper — `max-w-7xl`, responsive horizontal padding |
| `visually-hidden.tsx` | Screen-reader-only text — use instead of `aria-hidden` when content stays in the a11y tree |

## Composites (Radix, focus management built-in)

| File | What it is |
|---|---|
| `dialog.tsx` | Radix Dialog — focus trap, ESC, scroll lock, `aria-modal`. Never hand-roll a modal. |
| `accordion.tsx` | Radix Accordion — keyboard nav, `aria-expanded`, `aria-controls`. Used in FAQ blocks. |
| `sheet.tsx` | Side-anchored drawer (Radix Dialog variant) — `side: left/right/top/bottom`. Mobile nav. |

## Rules for agents

1. Import `cn()` from `@/lib/utils` for all className merging.
2. Use `buttonVariants` from `button.tsx` when styling any element as a button.
3. Never write `focus:outline-none` without a visible replacement — always `focus-visible:ring-2 focus-visible:ring-[--color-primary]`.
4. All transitions: `motion-safe:transition-*` to respect `prefers-reduced-motion`.
5. Input error states: `aria-invalid` + `aria-describedby` wired to `<p id="${id}-error" role="alert">`.
6. Dialogs/Sheets: always include `DialogTitle` + `DialogDescription` (or wrap in `VisuallyHidden`).

## Adding a new primitive

1. Read `knowledge-base/03-code-and-components.md` — especially the "buy vs build" table.
2. If Radix has it: wrap it (same pattern as composites above).
3. Add `forwardRef` + `displayName`. Add the file to the table above.
