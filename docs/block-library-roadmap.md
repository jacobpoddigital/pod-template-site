# Block Library Roadmap — gap analysis & tiered plan

**Status:** proposal · 2026-06-11
**Scope:** pod-template-site (the canonical client-site template). Everything below is measured against the *current* repo, not aspiration.

This roadmap answers two questions: **which card variants and which UI patterns are we missing**, tiered from "every site needs this" down to niche. It is grounded in (a) the union component list across shadcn/Radix/MUI/Chakra/AntD/daisyUI/Tailwind Plus, (b) 2025–26 trend evidence, and (c) CRO research on what actually converts. Sources are cited inline.

## Build status — branch `feat/block-library-tier-0-3`

**Shipped (building green: typecheck + lint + `pnpm build`):**
- ✅ **Tier 0** — Card variant axes (`elevation`/`emphasis`/`interaction`, backward-compatible) · Avatar · Tabs primitives.
- ✅ **Tier 1 blocks** — `pricing` (featured + monthly/annual Tabs toggle) · `team` · `stats_band` · `reviews` extended with avatar + company logo.
- ✅ **Tier 2 blocks** — `tabbed_content` · `process_steps` · `bento_grid` · `case_studies` · `timeline` · `newsletter` · `gallery`.
- ✅ **Tier 3 blocks** — `before_after` · `toc` · `integrations_grid` · `pricing_matrix` · `locations_map` · `video_testimonial` · `feature_rows`.
- ✅ **Globals** — announcement bar (dismissible) · sticky mobile CTA (site.config-driven).
- ✅ **Header H1–H4** — desktop flyout / sub-menus (Radix navigation-menu; nested `children` now render on desktop) · sticky/scroll-aware header (hide-on-scroll-down, reveal-on-up, opaque) · in-header theme toggle · `aria-current` on the active link · `lg:h-20` + `scroll-pt-20`.
- ✅ **`/blocks` variant showcase** — every block under its tone/layout/columns/media-position variants.

All 14 new blocks wired end-to-end: SDL → fragment → `pnpm codegen` → adapter → schema/component/registry → `/blocks` samples + dev mock. `wp/acf-fields/` stays empty by design (per-client ACF is generated at provision time — FRICTION #70).

**Remaining:**
- ⏳ Header utility slots beyond the theme toggle (search, locale switcher, cart) — deferred until a client needs them (build stubs only).
- ⏳ HQ `workflow/29-block-library.md` catalogue update.
- ⏳ When a real WP is provisioned: generate the per-client ACF field JSON for the 14 new layouts + run `pnpm codegen` against the live schema.

---

## Where we are today (verified)

**Registered blocks (20):** `hero`, `feature_grid`, `faq`, `cta_banner`, `logo_strip`, `contact_form`, `media_text`, `card_grid`, `services_grid`, `usp_bar`, `reviews`, `rich_text`, `columns`, `video`, `key_takeaways`, `stat_with_source`, `comparison_table`, `author_byline`, `post_grid`.

**UI primitives present:** Button, ButtonLink, Card, Accordion, Badge, Dialog, Sheet, Slider (Embla), Skeleton, Checkbox, Input, Label, RadioGroup, Select, Textarea, Separator, RichText, Container, Section, VisuallyHidden, VideoFacade.

**UI primitives missing:** **Tabs, Avatar, Tooltip**, Stepper/Steps, Timeline, Progress, Switch, AspectRatio, Popover, HoverCard, Breadcrumb, Pagination, Toast/Sonner.

**Section settings contract (every block):** `tone` (default/muted/inverted/accent) · `spacing` (default/compact/spacious/none) · `container` (default/narrow/full) · `anchor`.

**The core structural gap:** the `Card` primitive is *static* — no variants. `card_grid`, `services_grid`, `feature_grid`, `reviews` each re-implement a near-identical card by hand. There is no shared notion of *how a card can look*. Most of what feels "missing" is actually **unexposed variant axes on a card we already have**, not new blocks.

---

## Tier 0 — Foundation (do first; unblocks the rest)

These aren't user-facing blocks; they're the primitives every tier below depends on. Build them before anything in Tier 1.

| Item | What | Why |
|---|---|---|
| **Card variant axes** | A shared CVA contract on `Card`: `media` (top · left/horizontal · overlay · icon · none) · `elevation` (flat · outline · shadow) · `emphasis` (default · featured) · `interaction` (static · whole-card-link). `card_grid`/`services_grid`/`feature_grid` collapse toward one engine. | Card anatomy is a solved problem ([EightShapes](https://medium.com/eightshapes-llc/cards-and-composability-in-design-systems-8845ecbee50e)). Exposing axes covers ~80% of perceived gaps with zero new blocks. Matches how we already do `section-settings` and hero `layout`. |
| **Avatar** primitive | Image+fallback initials, sizes. | Blocks Tier-1 photo testimonials and team cards. Ubiquitous across every library. |
| **Tabs** primitive | Radix Tabs, keyboard + ARIA. | Blocks pricing toggle and tabbed content. Ubiquitous; conspicuously absent. |

---

## Tier 1 — Very common (nearly every marketing/service site)

Highest priority. Each maps to a strong conversion or table-stakes need.

| Item | Model as | Why (evidence) |
|---|---|---|
| **Pricing** block | New block + `pricing` card variant + monthly/annual **Tabs** toggle; "most popular" highlight. | Table stakes for service/SaaS. Single primary CTA per plan converts better ([SaaSHero](https://www.saashero.net/design/saas-landing-page-best-practices/)). Already on the workflow/29 backlog. |
| **Testimonials with a face** | Extend `reviews` schema: add `avatar` + `company_logo`. | Photo testimonials are significantly more memorable than text-only (CXL, p=0.0035) — the single cheapest credibility win we're missing ([CXL social proof](https://cxl.com/research-study/social-proof/)). |
| **Team** block | New block, `profile` card variant (avatar, name, role, bio, socials). | Standard on every agency/professional-services site. |
| **Stats band** | New block (clean KPI row: number + label), distinct from `stat_with_source`. | Common, but **supporting proof only** — raw numbers had the *lowest* recall in CXL's study. Ship it, don't lead with it. |
| **Sticky mobile CTA** | Global layout feature (not a block) — sticky bottom bar on mobile. | Best-evidenced interaction here: +8–31% conversions across studies ([Contentsquare/sticky CTA data](https://www.stickyctas.com/articles/sticky-ctas-data), [Conversion Rate Experts](https://conversion-rate-experts.com/sticky-cta-win-report/)). |
| **Announcement / banner bar** | New block or layout slot; dismissible. | Ubiquitous (Tailwind Plus ships 13 variants). Useful for offers, notices. |

---

## Tier 2 — Common (most sites, context-dependent)

| Item | Model as | Why |
|---|---|---|
| **Tabbed content** | New block on the **Tabs** primitive. | Ubiquitous pattern for service/feature showcases without page sprawl. |
| **Process / numbered steps** | New block; needs **Stepper** primitive. | "How it works" 1·2·3. People fake it with `card_grid` and lose the numbering/connector semantics. |
| **Bento grid** | `card_grid` `layout` variant (`grid`/`slider`/**`bento`**) using the Tier-0 card sizing. | The most durable structural trend of 2025–26 ([studiomeyer reality-check](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check)). A layout, not a skin. |
| **Case study / results spotlight** | New block; `result` card variant (logo + headline metric + one line + link). | An agency's "heavy artillery" — quantified outcomes for late-stage B2B buyers ([NN/G B2B](https://www.nngroup.com/articles/b2b-usability/)). Higher-value than generic `card_grid`. |
| **Timeline** | New block; needs **Timeline** primitive. | Company history, onboarding, vertical/horizontal. |
| **Newsletter signup** | New block (inline email capture). | Distinct conversion job from `contact_form`. Tailwind Plus ships 6 variants. |
| **Gallery / lightbox** | New block; needs **Dialog** (have it) + **AspectRatio**. | Trades, hospitality, portfolios. |

---

## Tier 3 — Less common / specialized

| Item | Model as | Why |
|---|---|---|
| **Before/after slider** | New block (Embla/Slider already present). | Trades, design, fitness, dental. |
| **Table of contents / sticky sub-nav** | New block; leverages existing `anchor` settings. | Strong for long-form SEO content — core to our business. |
| **Integrations / app grid** | `logo_strip` variant or new block. | SaaS-adjacent clients. |
| **Pricing comparison matrix** | Extension of `pricing` + existing `comparison_table`. | Multi-tier feature comparison. |
| **Map / locations** | New block. | Local/multi-branch service businesses. |
| **Video testimonial** | `reviews` `video_id` field + facade. | Higher-trust social proof; pairs with VideoFacade. |
| **Alternating feature rows (zig-zag)** | New block, or chain `media_text`. | Enforces the alternation rhythm in one block. |

---

## Tier 4 — Niche / deferred (ecom validation gated)

`product_grid`, `product_categories`, archive/single composition → deferred to the WooCommerce workflow (workflow/14). Job/listing cards, event cards → only when a client needs them.

---

## UI primitives to add, tiered

- **Tier 1:** Tabs, Avatar, Tooltip
- **Tier 2:** Stepper/Steps, Timeline, AspectRatio, Switch, Progress, Popover
- **Tier 3:** HoverCard, Breadcrumb, Pagination, Toast/Sonner

(Card-state variants — **skeleton** and **empty** — are commonly under-built; we have Skeleton, so wire it into the card variants in Tier 0.)

---

## Do NOT build (evidence-based — keep off the menu)

- **Auto-rotating hero slider / carousel** — ~1% interact with slide 1, <0.5% beyond; NN/G recommends a static hero ([NN/G carousels](https://www.nngroup.com/articles/designing-effective-carousels/), [CXL](https://cxl.com/blog/dont-use-automatic-image-sliders-or-carousels/)). Already on our never-build list.
- **Multiple primary CTAs** in one section — single-CTA pages convert better.
- **6+ trust badges** — breeds skepticism; use 1–2 near the action ([Popupsmart](https://popupsmart.com/blog/how-to-use-e-commerce-trust-badges)).
- **Heavy 3D/WebGL hero, AI-personalization gimmicks** — 2025 hype that under-delivered.
- **Glassmorphism on body content** — confine to nav/modals only.

**Gate rule:** every addition passes the conversion gate (`get_knowledge(agent="design")` + CRO KB), not "competitors have it." Bento and hover-reveal cards can hurt scannability/mobile if applied wholesale.

---

## Suggested build order

1. **Tier 0** — card variant axes + Avatar + Tabs. (Unblocks half of Tier 1.)
2. **`reviews` avatar/logo extension** — tiny schema change, biggest credibility ROI.
3. **Pricing** + **Team** + **Stats band**.
4. **Sticky mobile CTA** (layout) + **announcement bar**.
5. Tier 2 as client demand surfaces.

Anything added here updates **workflow/29 (block library)** in HQ in the same session, per template-repo discipline.
