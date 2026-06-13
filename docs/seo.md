# SEO, sitemap, redirects & GEO

How this template handles search + AI discoverability. All of it is **headless-aware**:
WordPress is the data store; the **frontend owns the rendered `<head>`, sitemap, robots and
redirects**. Boilerplate checklist §6/§13.

## Per-page meta + OpenGraph — Yoast (free)

The SEO source of truth is **Yoast SEO (free)**, exposed to GraphQL by the **"Add WPGraphQL SEO"**
plugin (both installed by `wp/provision.sh`). Editors get the full Yoast UI (snippet preview,
social tabs, schema); the frontend reads it.

- Query: `src/lib/cms/queries/page-by-slug.graphql` → `seo { title metaDesc opengraph* twitter* metaRobots* schema { raw } }`.
- Normalized to a **source-agnostic** `PageSeo` (`src/lib/cms/types.ts`) in `toSeo()` (`src/lib/cms/index.ts`) — if we ever swap the SEO source, only `toSeo` + the query change.
- `pageMetadata()` (`src/lib/cms/metadata.ts`) builds Next `Metadata`: title → OG/Twitter title, `metaDesc` → description, OG/Twitter images, and `robots` from `metaRobotsNoindex/Nofollow`. Used by every content route's `generateMetadata`.
- **Fallback chain:** Yoast field → page title / `siteConfig.description` → site default OG. A page with no Yoast data still gets sane tags.
- **Free Yoast is enough** — title, meta description, canonical, OpenGraph, Twitter, and the JSON-LD **schema graph** are all in the free tier. Premium only adds the redirect manager + multiple keyphrases, which we don't need (redirects live in Next — see below).

### Yoast headless URLs (canonical / OG / schema)

Yoast generates canonical, OG `url`, and JSON-LD `@id`s from `home_url()`. In a headless setup
that must be the **frontend** origin, not WordPress. We do this the standard way — **set the
WordPress "Site Address (home)" to the frontend origin** while leaving "WordPress Address
(siteurl)" as the WP backend (so `/wp-admin` + `/graphql` keep working):

```bash
FRONTEND_URL=https://client.com bash wp/provision.sh   # sets the home option
# or: wp option update home 'https://client.com'
```

Then Yoast emits frontend URLs natively — no per-filter hacks. `pageMetadata` *also* sets
`canonical` from the route path as belt-and-braces. `wp/mu-plugins/pod-yoast-headless.php`
disables Yoast's own XML sitemap (we own `/sitemap.xml`).

### Per-page JSON-LD

`seo.schema.raw` (Yoast's graph: WebPage / BreadcrumbList / Article / Organization) is injected
by `<SeoSchema>` (`src/app/seo-schema.tsx`) into the page HTML. This is **in addition to**
`structured-data.tsx` (site-wide Organization + WebSite) and the **FAQ block's own FAQPage
JSON-LD**. Multiple JSON-LD blocks are valid and additive.

## Sitemap

`src/app/sitemap.ts` is the **only** sitemap (Yoast's is disabled). It lists every published
**page and post**, frontend URLs only, with `lastModified` on posts.

> **Posts** resolve at the standard blog route `/blog/<slug>` (the template ships the blog
> by default — see `docs/blog.md`, workflow/34); the sitemap lists them there. If a site
> has no published posts, `getAllPosts()` returns `[]` and nothing is added — safe by default.

Submit `/sitemap.xml` to Google Search Console + Bing Webmaster Tools at go-live (see
`docs/go-live-checklist.md`).

## robots & noindex

`src/app/robots.ts`:
- **Production** allows all crawlers, **including AI** (GPTBot, etc.) for training + retrieval — sites exist to be found. Per-client opt-out = add disallow rules there.
- **Non-production** (any `VERCEL_ENV !== production`, or `NEXT_PUBLIC_NOINDEX=1`) disallows everything, so staging never leaks into search.
- Per-page `noindex`/`nofollow` is editor-controlled in Yoast and flows through `pageMetadata` → Next `robots`.

## Redirects (§13)

Free Yoast has **no redirect manager**, so redirects live at the **edge (Next/Vercel)**, sourced
two ways and merged at build/deploy (`redirects.config.ts` → `next.config.ts redirects()`):

1. **`redirects.json`** — the committed inventory. Use this for a **site migration**: map every
   changed old URL → new path so its ranking 301s across. `redirects.example.json` shows the
   shape (`{ source, destination, permanent }`; `:param` segments supported).
2. **`WP_REDIRECTS_URL`** *(optional)* — a normalized JSON endpoint so editors keep managing 301s
   in the **familiar WP plugin UI**. Pod's usual plugin is **"301 Redirects" by WebFactory**
   (`eps-301-redirects`). It has no public export endpoint, so the template ships a tiny read-only
   shim mu-plugin — **`wp/mu-plugins/pod-redirects-export.php`** — that re-publishes its redirects
   as `GET /wp-json/pod/v1/redirects` → `[{ source, destination, permanent }]`. Point
   `WP_REDIRECTS_URL` at that. On deploy we fetch + merge it. **Enforcement moves from the WP
   server to the edge** — the plugin is just the store.

   A WP redirect added after a deploy applies on the **next build**; wire a WP "save → deploy
   hook" (Vercel Deploy Hook) for near-immediate effect. Redirects never fail the build — a bad
   row or unreachable endpoint is logged and skipped; file rules win on a source collision.

> **Verified 2026-06-13** against the installed plugin: it stores rules in a CUSTOM TABLE
> `{prefix}redirects` (cols `url_from`, `url_to`, `status` = `301`/`302`/`307`/`inactive`) — **not**
> an option. The shim queries that table, maps `url_from`→source / `url_to`→destination /
> `status==='301'`→permanent, and skips `inactive`/`404` rows. End-to-end proven: a `301` row →
> Next 308, a `302` row → Next 307. For a different plugin, adapt the shim's query or just export
> to `redirects.json` at migration time.

## Content relationships (§18)

`getRelatedPosts({ category, excludeUri, first })` (`src/lib/cms/index.ts`) is the taxonomy
pattern for an article footer / "related" rail: recent posts in the **same category**, current
one dropped. Category-driven keeps it editor-controlled with no extra fields. Swap `category`
for a tag or an ACF post-relationship the same way when a project needs tighter curation.

## hreflang (multi-locale) — plan only

The template is single-locale (`siteConfig.locale`). When a site needs multiple languages:

- Add locale routing (e.g. `app/[locale]/...` or domain-per-locale).
- In each page's `generateMetadata`, set `alternates.languages` — Next renders `<link rel="alternate" hreflang="…">`:
  ```ts
  alternates: {
    canonical: canonicalPath,
    languages: { "en-GB": `/en${path}`, "fr-FR": `/fr${path}`, "x-default": path },
  }
  ```
- Mirror the locale split in WordPress (WPML/Polylang expose locale to WPGraphQL) and include every locale URL in `sitemap.ts`.

Defer until a real multi-locale client — don't pre-build it.

## GEO / AEO — optimising for LLMs & answer engines

We're a marketing agency; AI search (ChatGPT, Perplexity, Google AI Overviews, Copilot) is now a
real discovery channel. What this template already does, and what to lean on:

- **`/llms.txt`** (`src/app/llms.txt/route.ts`) — the emerging "robots.txt for AI": a curated
  markdown index of canonical pages. Generated from the published page list.
- **AI crawlers allowed** in `robots.ts` (training + retrieval). Note: you can split these per
  client — e.g. allow `OAI-SearchBot`/`ChatGPT-User` (retrieval) while disallowing `GPTBot`
  (training) if a client objects to training use. Document the choice per site.
- **Rich JSON-LD** — Organization + WebSite (site-wide), Yoast's per-page graph, and per-block
  schema (FAQ block → FAQPage). Schema is the single biggest lever for machine extraction;
  prefer blocks that emit it (FAQ, and extend Key Takeaways / How-it-works / Comparison with
  HowTo / ItemList when a page warrants it).
- **Answer-first content + E-E-A-T blocks** — the library's `key_takeaways`, `stat_with_source`,
  `author_byline`, `faq`, `toc`, `comparison_table` exist precisely so pages lead with the
  liftable answer + a citable source. Use them on informational pages (KB conversion §citation).
- **Clean semantic HTML + SSG** — server-rendered, fast, real headings; LLM crawlers don't run
  JS, so everything that matters is in the initial HTML (all our JSON-LD is server-rendered).
- **Bing matters** — ChatGPT search + Copilot use the Bing index. Submit the sitemap to **Bing
  Webmaster Tools** (and consider IndexNow) alongside Google at go-live, not just GSC.

These are levers, not a checklist — pick per page. The structural wins (schema + answer-first
blocks + fast SSR HTML + llms.txt) are already in the box.

## Structured-data policy — no self-serving review markup

**Never** emit `Review` or `AggregateRating` JSON-LD for the business on its own site
(attached to `Organization` / `LocalBusiness`). Google rules self-serving review markup
**ineligible** for star results, and an embedded third-party review widget counts as
self-serving too (research `2026-06-13-eeat-website-build.md` §D2). Testimonials render as
plain HTML (the `reviews` block — display only, no rating markup).

Review/AggregateRating are valid **only** on `Product`, `Recipe`, `Book`, `Course`,
`Event`, `Movie`, `SoftwareApplication` (+ a few media types) with **genuine first-party**
reviews — e.g. a WooCommerce product page. When the enhanced `Organization` schema lands
(plan Phase 1 #3), the JSON-LD builder enforces this in code; until then it's guarded by
the comments at `src/app/structured-data.tsx` and `src/blocks/reviews/reviews.tsx`.

## Organization schema (single `@id`, E-E-A-T §B1)

A site-wide `Organization` node (+ `WebSite`) is emitted as a `@graph` from
`src/app/structured-data.tsx` (via `layout.tsx`, which passes the `SiteChrome` it
already fetched — no extra request). It merges:
- **WP Site Options** (editor-managed): `logo`, `social[]`→`sameAs`, `phoneNumbers[0]`→
  `contactPoint.telephone`, `address`.
- **`site.config.ts` → `organization`** (stable legal identity, dev-set): `legalName`,
  `foundingDate`, `vatId`/`taxId`, `email`, `contactType`, `founders[]`, plus optional
  `logoUrl`/`sameAs`/`addressText` overrides. All optional — omitted when empty.

**Single `@id` (Yoast reconciliation).** Our node uses `@id = ${SITE}/#organization`,
matching Yoast's company-node convention. Because provision points WP `home` at the
frontend origin, Yoast's per-page graph emits its Organization/publisher at the **same**
`@id` → Google merges them into one entity and ours augments it. The blog `Article`
fallback's `publisher` references `{ "@id": …/#organization }` too.

**Go-live requirement:** in Yoast → Site representation, set the site as an
**Organization** (not Person) with the **same name + logo** as `site.config`, so the
two descriptions of `/#organization` agree. Fill the `site.config.organization` block
per client.

> Review/AggregateRating are **type-impossible** on this node (the `OrganizationSchema`
> shape has no such keys) — see §Structured-data policy. `LocalBusiness` subtypes are a
> Phase-3 follow-on (build-profile gated).
