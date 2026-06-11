---
name: apply-brand
description: Apply a client's design system to a Pod client site — drop in the design_system agent's tokens.css handoff (the full --brand-* contract, ADR 0015) and load the client's fonts. Use when starting a client build, or rebranding/re-theming a pod-site-* repo. The WHOLE rebrand is tokens + fonts; never edit components to change the look.
---

# /apply-brand — apply a client design system to a Pod site

The design_system agent emits a per-client **`tokens.css`** (the full `--brand-*` contract, ADR 0014/0015). The template ships Pod's *house defaults* in `src/styles/theme.css`; a client brand is just **those token values, swapped, plus the client's fonts loaded.** Everything retunes from there — blocks, the chrome (header/footer/nav), the shadcn `ui/*` primitives, the type scale, even bare/injected elements. **Zero component edits.** (Proven on the `demo/lumen-brand` branch: deep indigo + electric lime + Space Grotesk, applied through one override file + two fonts.)

## ⛔ The law — read before touching anything

**To change how the site looks, you change TOKENS, never components.** If something is off-brand, the fix is a token value, not a className. Raw `text-<size>` and raw hex in components are lint-banned (`eslint.config.mjs`) precisely so the brand stays token-driven. If you find yourself editing a block/primitive to rebrand, stop — the token is wrong, or a rung is missing from the handoff (fix it at the design_system agent, not here).

**KB gate:** call `get_knowledge(agent="design")` (add `project_slug`) for the token contract + design-language rules before applying. *Fallback:* `knowledge-base/01-design-language.md` (type scale + token steps) and `decisions/0015-full-brand-token-contract.md`.

## Inputs needed (ask if missing)

1. The design_system handoff **`tokens.css`** — the `:root { --brand-* }` set. It MUST include all 9 type rungs (`display-xl/lg/md/sm/xs · body-lg/body/body-sm · label`) and every group (colour, type, spacing, radius, shadow, motion, fonts). A missing rung = the agent didn't emit it → fix the agent, don't invent it here.
2. The **fonts**: display family + body family, and source (Google → `next/font/google`, or files → `next/font/local`). The handoff gives family *names*; loading them is this build-time step (ADR 0015 — font loading can't be a pure token).

## Steps

### 1. Apply the tokens → `src/styles/theme.css`
`theme.css` IS this client's brand (their own repo). Replace the `:root` `--brand-*` **values** with the handoff's, keeping the file's structure + comments. Don't touch `globals.css` (the translation layer — it maps `--brand-*` → the shadcn bridge + `@theme`; it never changes per client). Set `--brand-font-display` / `--brand-font-sans` to the CSS vars you wire in step 2.

> Quick experiment instead of a full swap? Add `@import "../styles/<name>-tokens.css";` right after the `theme.css` import in `globals.css` — a later `:root` wins. (That's the demo pattern; for a real client, edit `theme.css`.)

### 2. Load the fonts → `src/app/layout.tsx`
```ts
import { Space_Grotesk, Inter } from "next/font/google"; // ← the client's families
const display = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], weight: ["500","600","700"] });
const body = Inter({ variable: "--font-inter", subsets: ["latin"] });
// <html className={`... ${display.variable} ${body.variable}`}>
```
Then in `theme.css`: `--brand-font-display: var(--font-space-grotesk), …; --brand-font-sans: var(--font-inter), …;`. Load **only the weights used** (each = a request). Headings already read `--brand-font-display` (globals.css base + `.display-*`); body reads `--brand-font-sans`.

### 3. Verify (all required)
```
pnpm typecheck && pnpm lint && pnpm build      # lint enforces token-only typography
pnpm start  (or pnpm dev)                      # then screenshot the live pages
```
Visual check — render `/styleguide` (every primitive + the brand swatches + section tones), `/blocks` (the full library), and `/`:
```
npx playwright screenshot --full-page --viewport-size=1280,900 http://localhost:<port>/styleguide /tmp/brand-styleguide.png
```
Read the screenshot and confirm: **primary + accent** match the brand; **headings render in the display font**; the **type scale** ladders (hero `display-xl` → section `display-md` → card title `display-xs`); **radius** matches. If a colour/size is off → fix the **token**, re-verify.

## Dark mode (on by default — device detection + a footer toggle)
The mechanism ships in the template; you only supply the **dark colour values**.
- **Each colour token is `light-dark(LIGHT, DARK)`** in `theme.css` (`--brand-surface`/`-raised`/`-muted`,
  `--brand-ink`/`-muted`, `--brand-border`, `--brand-shadow-*`, and tuned `--brand-primary`/`-accent`/
  semantic). Dark = tinted dark (never pure `#000`), light ink (not pure white), KB 01. The value flips
  with `color-scheme`, so **everything (blocks, chrome, the section tones) re-derives** — no component work.
- **Already wired (don't rebuild):** `color-scheme` + the `[data-theme]` rules in `theme.css` (device
  detection by default, manual override), the **no-flash inline script** in `layout.tsx`, the
  `viewport.themeColor`, and the **footer `ThemeToggle`** (light/dark/system, persisted).
- **A light-only brand** simply provides equal light/dark values (or delete the dark halves).
- **Verify both modes:** `npx playwright screenshot --color-scheme=dark …` (+ light). Confirm contrast
  (≥4.5:1, KB), the three section tones are distinct, accent still pops, no pure black, footer reads as a
  subtle muted surface (it uses `bg-surface-muted` — not inverted). NEVER use per-component `dark:`
  utilities or hardcoded colours — dark lives entirely in the tokens.

## Commit
One commit: `feat(brand): apply <client> design system (tokens + fonts)`. Note the design run / approval that authorised the brand. Never commit a `*-tokens.css` *override* into a client repo — fold the values into `theme.css`.
