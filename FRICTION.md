# FRICTION.md — template troubleshooting log

Common GraphQL / ACF / headless-WP stumbles hit while building on this template, and the fix.
**Read this before your first WP-connected build.** Every entry was a real stumble that cost time.
HQ keeps the agency-wide version (`web-ai-automation/FRICTION.md`); this file is the template-local subset
a Claude Code agent sees without the Hub. Add a line whenever something here bites you again.

> The enforceable rules distilled from these live in `docs/standards.md §12`. This file is the
> "why / symptom"; standards.md is the "do this".

---

## GraphQL / ACF

**The page-blocks ACF group (`pageFields`) is GENERATED — never hand-author it.**
`scripts/generate-acf-blocks.mjs` builds `wp/acf-export.json` (`field_pod_blocks`, all 36 layouts) FROM `src/lib/cms/schema.graphql`; `pod-blocks-register.php` loads it; `provision.sh` regenerates + copies it. So WP-ACF can't drift from the frontend. **Repeater names are layout-prefixed + unique** (`faq_items`, not `items`) because wpgraphql-acf 2.x makes a GENERIC type per repeater field NAME — faq/usp `items` would collide. The query aliases the unique name back to the block prop (`items: faqItems`).

**Block query 500s against live WP but passes in mock mode → wpgraphql-acf 2.x type names.**
2.6.x emits `PageFieldsBlocks<Layout>Layout` (not the old `Page_Pagefields_Blocks_*`). The committed schema/query/adapter already use the 2.x names; if you change blocks, re-run `scripts/migrate-blocks-2x.mjs <live-sdl> <old-schema>` (regen from live) — don't hand-edit the 36 fragments. The image field is an edge (next entry).

**codegen fails on an ACF image field (`image { altText }`).**
2.x exposes ACF images as `AcfMediaItemConnectionEdge`. Query `image { node { sourceUrl altText mediaDetails { width height } } }`; the block adapter's generic `{node}`-flatten restores `image.sourceUrl`. Add the client media host to `next.config` `images.remotePatterns`.

**Flat ACF fields (User/Post/options) 500 on live unless HAND-registered.**
wpgraphql-acf nests an ACF group under a sub-field, not the flat `user { roleTitle }` / `post { postFields { … } }` the committed queries read. Hand-register the GraphQL surface in a mu-plugin (`pod-author-register.php`, `pod-post-fields-register.php`, `pod-category-image-register.php`, `pod-chrome-register.php` — all the same pattern). Page BLOCKS are the exception (auto-exposed; that's why their type names must match).

**Live builds reveal unprovisioned ACF fields ONE AT A TIME — and `.next` caches the 500.**
After fixing a WP-side field, `rm -rf .next` before rebuilding — Next's fetch cache serves the stale failed response, so you'll see the SAME error. Each fix + cache-clear surfaces the next missing field (blocks → author → post → …).

**`siteOptions` / menu query 500s on live WP (mock fine).**
The chrome isn't registered WP-side. Ensure `wp/mu-plugins/pod-chrome-register.php` is present and a `*-site-options.json` field group exists, then re-provision. The plugin **hand-registers** `RootQuery.siteOptions` — do not rely on wpgraphql-acf auto-exposing the options page (it nests it self-referentially as `SiteOptions.siteOptions`).

**Blog/case-study pagination uses CORE cursors — no offset plugin.**
`getBlogPosts`/`getCaseStudies` walk `first`/`after` + `pageInfo.hasNextPage/endCursor` and window in memory (path-based `/blog/page/[n]` stays indexable via self-canonical + crawlable `<a href>`). Do NOT add `wp-graphql-offset-pagination` (delisted from wp.org; cursor is the WPGraphQL-recommended approach). `categoryImage` on `Category` is hand-registered (`pod-category-image-register.php`).

**Empty ACF repeater arrives as `null`/`false`, not `[]`.**
Schema field is `z.array(item).nullish()`. Do not use the REST-era `z.union([…, z.literal(false)])`.

**A required Zod field renders fail-loud on a blank page.**
A `.min(1)` Zod field must be marked _Required_ in the `wp/acf-fields/*.json` layout, or an editor leaving it blank fails the page build.

## Provisioning / Docker

**Database never becomes ready / MariaDB `ib_logfile0 not found`.**
A half-initialised `db_data` volume is corrupt. Fix: `docker compose down -v --remove-orphans` then re-run `provision.sh`. Don't try to repair individual files.

**A new mu-plugin doesn't take effect after provision.**
`provision.sh` copies `mu-plugins/*.php` (all of them). If you added one and it didn't load, you're on an old provision.sh that named a single file — update it, or re-run after the fix.

## Next.js / CSS

**Vendored / non-Tailwind CSS silently doesn't load.**
Tailwind v4 won't inline a plain-CSS `@import` from `globals.css`. Import it in `src/app/layout.tsx` (`import "../styles/x.css"`).

**`CssSyntaxError: Unclosed string` in a hand-written stylesheet.**
A CSS comment contains `*/` (e.g. listing selectors like `.wa-*/.pf-*`). It closes the comment early. Reword the comment without `*/`.

**Ported animated widget renders but looks broken / unframed.**
Per-instance frame sizing (width/height) lives in the source *page* CSS, not `components.css`. Carry it as explicit config (`frameWidth`/`frameHeight`) on the instance. See `docs/standards.md §12 → Porting a bespoke animated widget`.
