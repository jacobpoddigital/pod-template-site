# Build standards — the by-the-book rules

These are Pod Digital's enforceable build standards, distilled from the agency knowledge base
(`web-ai-automation/knowledge-base`). **Read the relevant section before building any UI.** They
are not suggestions — training defaults are wrong here; this is right. A violation that ships
(wrong heading weight, no focus ring, raw hex, missing label) is a process failure.

> This file exists so a Claude Code agent in a client repo follows the standards **without the
> Hub** (the build runs off-API). Keep it in sync with the HQ knowledge base.

---

## 1. Typography
- **Body weight ≥ 400** (never 300 at body sizes). **Headings ≥ 700** (800 for drama).
- **Measure: `max-width: 65ch`** on prose — always.
- Line-height: display 48px+ → 1.05; h1 → 1.1; h2 → 1.2; h3 → 1.25; lead → 1.5; body → 1.6; caption → 1.4.
- Tracking: hero 60px+ → `-0.04em`; h1 → `-0.03em`; h2 → `-0.02em`; h3 → `-0.01em`; body → 0; **all-caps labels → `0.08em` min (mandatory)**.
- Type scale: modular, rooted at 16px; default ratio **1.333** (Perfect Fourth) for professional services.
- **Never Inter/Poppins/Roboto as a display face** on marketing sites. Max **two typefaces**; monospace for code only.
- Display sizes (>48px) use `clamp()` — e.g. hero `text-[clamp(2rem,5vw+1rem,5.5rem)]`.
- **Hero→body heading ratio ≥ 4:1.**

## 2. Colour
- **OKLCH only — no hex literals in components** (`bg-[#3b82f6]` is always wrong). Tokens, not raw values.
- One accent is the default; a second colour needs genuine justification. 60/30/10 (neutral/secondary/accent).
- Neutral hue matches the accent (blue/indigo → slate; teal → sage; etc.).
- Dark mode: never pure `#000` (use tinted dark, e.g. `oklch(~0.16 0.02 255)`); text not pure white; drop font weight ~one step.
- Contrast: **4.5:1 body, 3:1 large text + UI**. Check before approval.

## 3. Spacing & layout
- Base unit **4px**, primary grid **8px**; all spacing a multiple of 4/8.
- Section vertical padding: compact `py-12 md:py-16 lg:py-20`; standard `py-16/20/24`; hero `py-16 md:py-20 lg:py-32`. Under `py-12` reads cramped.
- **Container padding always `px-4 md:px-8 lg:px-16`** — never `lg:px-16` without the base. Max width single `max-w-[1440px] mx-auto`.
- Touch targets **≥ 44×44px** (WCAG 2.5.5), ≥ 8px between adjacent targets. Primary mobile action in the bottom-third thumb zone.

## 4. Motion
- Durations: button press 80ms; hover 150ms; micro 150–200ms; dropdown 200ms; modal 280ms; **page ≤ 300ms** (above 300ms reads as loading); scroll-reveal 400ms.
- Easing: ease-out `cubic-bezier(0.16,1,0.3,1)` (entering); snappy `cubic-bezier(0.4,0,0.2,1)` (state); spring `cubic-bezier(0.34,1.56,0.64,1)` (playful).
- **Never `transition: all`** — name properties. **Animate only `transform` + `opacity`** (never width/height/top/left/margin).
- **`prefers-reduced-motion` override mandatory** on every transition/animation.
- Every interactive element has a hover state (≥ contrast change + 150ms). Loading state within 100ms of click; skeletons after 150–300ms, kept ≥ 300ms.
- Scroll-reveal: stagger only semantic sequences of 3–5 (cap 20). Not on generic card grids/footers. Prefer CSS `animation-timeline: view()`.

## 5. Code conventions (Next.js App Router + React 19)
- **Server Components by default**; `'use client'` only for state/browser-APIs/handlers, pushed as deep as possible (slot-bridge pattern).
- `cn()` for conditional classes; **CVA** for any component with ≥2 visual states. Prettier orders classes.
- `:focus-visible` (not `:focus`) for rings. `group`/`peer` + `aria-*` variants for JS-free interaction.
- `Promise.all` for independent fetches (never sequential await). Granular `<Suspense>`.
- Validate with **Zod on the server** for any external input (forms/webhooks). `useActionState`+`useFormStatus` for forms.
- `notFound()` for missing CMS resources. `await` async `params` (Next 15+). `error.tsx` is a Client Component.
- No barrel-file imports of heavy modules (defeats code-splitting). `next/dynamic` for heavy non-critical components.
- No module-level global stores (leaks state across requests on the server).

## 6. Performance (Core Web Vitals)
- Targets: **LCP ≤ 1.5s mobile · INP ≤ 200ms · CLS ≤ 0.05**. Judge on CrUX field data (75th pct), not Lighthouse.
- **`sizes` on every `<Image>`** matching the CSS. **`priority` on exactly ONE image/page** (the LCP candidate). Never `loading="lazy"` above the fold.
- AVIF preferred (~20–50% smaller than WebP). Blur placeholders for heroes only.
- Fonts: **`next/font` self-hosted**, `display:'swap'`, variable fonts, subset axes. No Google Fonts `<link>`.
- ISR + on-demand revalidation default; **tag every `fetch()` from day one** (`{ next: { tags, revalidate } }`). SSR only for request-specific data.
- `remotePatterns` locked to the WP origin `/wp-content/uploads/**` (never `hostname:'*'`).
- No synchronous third-party scripts in `<head>`. Defer chat widgets (button first, load on click). PostHog default analytics.

## 7. Accessibility (WCAG 2.2 AA)
**The six failures (96% of errors) — never ship these:**
1. Contrast < 4.5:1 body / 3:1 large+UI. 2. Missing/garbage alt (`alt=""` decorative; descriptive for content; never the filename). 3. Inputs without a real `<label for/id>` (placeholder ≠ label). 4. Icon links without an accessible name. 5. Icon buttons without an accessible name (`aria-label="Close menu"`, not `"X"`). 6. Missing `<html lang>`.
- **Focus ring on every interactive element** — `:focus-visible` double-ring; never `outline:none` without a replacement.
- One `<h1>`/page; never skip heading levels; headings mark sections not size.
- Landmarks: `<header>`, `<nav aria-label>`, `<main id="main-content" tabindex="-1">`, `<footer>`; skip-link first in `<body>`.
- `tabindex` only `0` or `-1` (never >0). Native `<dialog>`+`.showModal()` for modals (free focus-trap/Escape/return). Move focus to `<main>` heading after client nav.
- WCAG 2.2: target size **≥ 24×24** (use 44×44); `scroll-margin-top` so sticky headers don't obscure focus; consistent help placement; don't re-ask entered info; no cognitive-only auth.
- Forms: `useId()` ids; `aria-invalid`+`aria-describedby` on errors; error text says what to *do*. Live regions: `role="status" aria-live="polite"` (mounted before the update).

## 8. Conversion & content
- Section order: **Awareness → Credibility → Consideration → Action**. 80% of viewing is above the fold.
- Above the fold (non-negotiable): name + what/where; outcome-focused headline; **phone (prominent, `tel:`)**; specific primary CTA (not "Contact Us"); ≥1 trust signal.
- **Repeat the primary CTA at 3 positions** (above fold, after social proof, page end) + sticky mobile CTA. First-person CTA copy ("Get My Quote") beats second-person.
- Local services/trades: **phone converts 10–15× a form** — sticky click-to-call on mobile, phone in header on desktop; form ≤3 fields. Professional services: form wins; specificity wins.
- Trust: real photos over stock (+conversions). Testimonials specific + recent (retire >3yr); 4.2–4.5★ sweet spot; show "(143 reviews)"; place near (not below) the CTA (+68%). Link every accreditation badge to its register. Logo strip above the fold, named ("Trusted by 47 local homeowners").
- One signature moment per page; demonstrate before describing.

## 9. Responsive & mobile (Tailwind)
- **Mobile-first**: design 375px first, then add modifiers. Ask "what is this at 375px?" for every class. Most changes at `md:`/`lg:`; `lg:` is the primary inflection; use `sm:` sparingly.
- Container `px-4 md:px-8 lg:px-16`. Grid collapse: 4-col `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`; pricing `grid-cols-1 lg:grid-cols-3`; split reorders image above text on mobile.
- Nav: below `lg:` hamburger + drawer (`role="dialog" aria-modal`, Escape/backdrop close, scroll-lock, 44px button); `lg:`+ full nav. **Never a hamburger at desktop.** Header `h-16` mobile / `h-20` desktop; `scroll-padding-top` matches.
- **Body text ≥ 16px at all breakpoints.** Mobile inputs `text-[16px]` (iOS zooms below 16px). No hover-only patterns (mobile has no hover).

## 10. Design tokens (the contract)
- **Three tiers:** primitives (raw, never used in components) → semantic (roles, what components consume) → component (per-component, rare).
- This template's contract (ADR 0012): the **shadcn bridge `:root` is canonical** in `src/styles/theme.css` (`--primary`, `--background`, `--ring`, `--radius`, OKLCH) — the rebrand/handoff drop-in; `src/app/globals.css` derives the **agency semantic aliases** (`--color-accent`, `bg-surface`, `rounded-card`). **Components use tokens, never raw values.** Rebrand = edit `theme.css` only.
- Seven token categories required: colour, typography (composite size+lh+weight+tracking), spacing, radius, motion (duration+easing pairs), shadow, z-index (named layers).

## 11. Template hard rules — learned, enforce these (2026-06-11 audit + build)
These are codebase-specific musts. They were each a real miss; do not repeat them.

**Typography — use the SCALE CLASSES, never raw `text-*`.**
- Every text element uses a type-scale class: `display-xl/lg/md/sm/xs`, `body-lg/body/body-sm`, `label` — **never** `text-sm`/`text-lg`/`text-2xl` etc. (raw sizes bypass the brand tokens, so a client `tokens.css` can't retune them).
- Role → class: section heading `h2 display-md` · **card/item title `h3 display-xs`** · lead/intro `body-lg` · body `body`/prose · **small/meta `body-sm` (NOT `text-sm`)** · eyebrow `label` · hero `display-xl`. The chrome (header/footer/nav) uses the scale too.
- This applies to the form-control exception only: inputs/select/textarea are `text-base md:text-sm` (16px on mobile = no iOS zoom). That's the one sanctioned raw size.

**Accessibility (these shipped wrong once).**
- **Interactive controls ≥ 44px.** `Button` `md`=`h-11`, `icon`=`h-11 w-11`; form controls `h-11`. Icon-only links/buttons need `aria-label`; decorative icons `aria-hidden="true"`.
- **Card titles are real `<h3>`** (`CardTitle` renders `<h3>`), under the section `<h2>` — keep the hierarchy.
- **Repeated items are semantic lists** — `<ul role="list">`/`<li>` (the `role` is required; Tailwind's reset strips list semantics in Safari/VoiceOver).

**Security.**
- **WordPress HTML injected via `dangerouslySetInnerHTML` MUST pass through `sanitize()`** (`@/lib/sanitize`, `sanitize-html`) — rich_text, columns, post_grid excerpt. WP content is semi-trusted. **Do NOT use `isomorphic-dompurify`** — its jsdom dep breaks the Turbopack build (`ERR_REQUIRE_ESM`) and is heavy on Vercel.
- `target="_blank"` always carries `rel="noopener noreferrer"`. CMS-driven hrefs go through `next/link`/`<a>` (no raw `javascript:` execution).

**CMS data discipline.**
- **Map keys are stable + compound** (`key={`${value}-${i}`}`), never a bare content string (titles/questions/names collide).
- **Empty ACF repeaters arrive as `null` over WPGraphQL** → schema fields are `z.array(item).nullish()`. Do NOT use the REST-era `z.union([…, z.literal(false)])`.
- **A required Zod field (`.min(1)`) must be marked _Required_ in `wp/acf-fields/*.json`** (the renderer parses fail-loud, so a blank required field fails the page build).
- Tree-builders over CMS input (menus) need a **cycle guard** (skip self-parent + a visited set).

**Contract + structure.**
- **Every section block** spreads `...sectionSettingsFields` (tone/spacing/container/anchor) and applies them via `sectionProps(...)` on a `<Section>` root — **including hero** (default its spacing to `"spacious"`). Never a raw `<section>`, never hardcoded tone/padding. `anchor` is applied centrally in `BlockRenderer` (don't render it per-block).
- **Icons:** `lucide-react` for UI glyphs; **`react-icons/fa6` for social brands** (Simple Icons dropped the major social trademarks, so `react-icons/si` lacks them).

---

*Exhaustive detail lives in the HQ knowledge base (`web-ai-automation/knowledge-base/01–10`). This file is the in-repo enforceable subset. When they disagree, the HQ KB wins — update this file.*
