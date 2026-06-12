# FRICTION.md — template troubleshooting log

Common GraphQL / ACF / headless-WP stumbles hit while building on this template, and the fix.
**Read this before your first WP-connected build.** Every entry was a real stumble that cost time.
HQ keeps the agency-wide version (`web-ai-automation/FRICTION.md`); this file is the template-local subset
a Claude Code agent sees without the Hub. Add a line whenever something here bites you again.

> The enforceable rules distilled from these live in `docs/standards.md §12`. This file is the
> "why / symptom"; standards.md is the "do this".

---

## GraphQL / ACF

**Block query 500s against live WP but passes in mock mode.**
Almost always the wpgraphql-acf **type names**. 2.6.x emits `PageFieldsBlocks<Layout>Layout` (e.g. `PageFieldsBlocksHeroLayout`), repeaters generic (`PageFieldsBlocksItems`). The old `Page_Pagefields_Blocks_*` convention compiles but doesn't match live. Regenerate the SDL from the live endpoint and adopt the real names:
`pnpm dlx get-graphql-schema $WPGRAPHQL_URL > src/lib/cms/schema.graphql`.

**codegen fails on an ACF image field (`image { altText }`).**
2.x exposes ACF images as `AcfMediaItemConnectionEdge`. Query `image { node { sourceUrl altText mediaDetails { width height } } }` and flatten `.node` in the adapter. Add the client media host to `next.config` `images.remotePatterns`.

**`siteOptions` / menu query 500s on live WP (mock fine).**
The chrome isn't registered WP-side. Ensure `wp/mu-plugins/pod-chrome-register.php` is present and a `*-site-options.json` field group exists, then re-provision. The plugin **hand-registers** `RootQuery.siteOptions` — do not rely on wpgraphql-acf auto-exposing the options page (it nests it self-referentially as `SiteOptions.siteOptions`).

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
