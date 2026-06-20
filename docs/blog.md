# The standard blog

Every site we build ships a blog (decided 2026-06-13; workflow/34). It renders normal
WordPress post content (Gutenberg/classic editor output) as sanitized HTML in a prose
container — **not** ACF blocks. Ported from Pod's proven Great White blog, mapped to
this template's design system (tokens + type-scale classes, not Great White's CSS).

Best-practice basis: `web-ai-automation/research/2026-06-13-headless-blog-best-practices.md`.

> The blog uses WordPress's **native `post`** type. For the **custom-post-type** pattern
> (a registered CPT with its own ACF group → typed GraphQL → SSG routes), see
> [`docs/custom-post-types.md`](./custom-post-types.md) — the worked `case_study` example.

## Routes

| Route | What |
|---|---|
| `/blog` | Index (page 1): hero → filter → featured article → 12-post grid → pagination |
| `/blog/page/[n]` | Path-based pagination (SEO-clean; `/blog/page/1` 301s to `/blog`) |
| `/blog/[slug]` | Single post: content, author box, tags, related posts, breadcrumb |
| `/blog/category/[slug]` (+ `/page/[n]`) | Category archive (uses the category's ACF banner image) |
| `/blog/tag/[slug]` (+ `/page/[n]`) | Tag archive |
| `/blog/author/[slug]` (+ `/page/[n]`) | Author archive — photo, role, bio, posts; E-E-A-T `ProfilePage`/`Person` schema |

All are SSG (`dynamic = "error"`, `dynamicParams = false`) — new posts appear on the next
build/ISR. The frontend **owns the permalink** (`/blog/<slug>`), not WP's `uri`.

## Configure (per client)

`site.config.ts` → `blog`: `perPage` (default 12), `title`, `intro`, `bannerImage`
(index + tag-archive hero background; a category's own ACF image overrides it on its
archive), `featured` (show the newest post as a featured article on the index).

To remount off `/blog`: change `BLOG_BASE` in `src/lib/cms/blog.ts` **and** rename the
`src/app/blog` route folder.

## WordPress requirements

1. **No pagination plugin.** Path-based `/blog/page/[n]` uses CORE WPGraphQL cursors
   (`first`/`after` + `pageInfo.hasNextPage`/`endCursor`), walked + windowed in
   `getBlogPosts`. This is the WPGraphQL-recommended approach and needs no addon (the old
   `valu-digital/wp-graphql-offset-pagination` was delisted from wp.org). Indexability comes
   from a self-referencing canonical per page + crawlable `<a href>` pager links (see
   `archiveMetadata` + `blog-pagination.tsx`), not from `rel=prev/next` (Google retired it).
2. **Category banner image (optional, Great White parity):** register an ACF image field
   on the Category taxonomy, "Show in GraphQL" ON, GraphQL Field Name `categoryImage`
   (the template ships `wp/acf-fields/*-category-image.json` + `pod-category-image-register.php`).
   Then regenerate the SDL (`pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" >
   src/lib/cms/schema.graphql`) and `pnpm codegen`. Categories with no image fall back to
   `blog.bannerImage`, then to a clean muted band.
3. **Yoast** (already the agency default) drives per-post meta + the `seo.schema` graph.
4. **Author meta (optional, E-E-A-T):** the author archive + `Person` schema read optional
   ACF **user** fields — `roleTitle`, `teamProfileUrl` (→ Meet-the-Team link), `profileImage`,
   a `social` repeater (`label`+`url`, the `sameAs` signal), and `knowsAbout` (text repeater →
   `Person.knowsAbout` + a "Writes about" line). Register an ACF "User" field group (Show in
   GraphQL) then regenerate the SDL + `pnpm codegen`. All null otherwise — the page falls back
   to the WP display name, the user `description` bio, and the Gravatar.
5. **Article citations (optional, E-E-A-T §C2):** an ACF "Post Fields" group on the Post type
   with a `sources` repeater (`label`/`url`/`publisher`, Show in GraphQL) → renders a "Sources"
   section after the article + `Article.citation`. Register + regenerate the SDL; empty → omitted.

## Authors & E-E-A-T

Author archives (`/blog/author/<slug>`) are sourced from the **WP User** (not the ACF Team
block — deliberately loose-coupled; see research `2026-06-13-eeat-website-build.md`). Each is
indexable with a self-canonical and emits `ProfilePage` + `Person` JSON-LD (`name` = name only,
`jobTitle` = role, `sameAs` = social links, `url` = the archive). Post bylines + the author box
link here; when `teamProfileUrl` is set the author shows a "Meet the team" link. Not every author
need be a team member (guest authors) and vice-versa — populate the ACF user fields to enrich.

## SEO behaviour (and why)

- **Self-referencing canonical on every page.** `pageMetadata`/`archiveMetadata` set the
  canonical to the *frontend* path, including `/page/N` — never canonical-to-page-1
  (which hides deeper posts from indexing). Research §1.1.
- **Page 2+** get a `– Page N` title so they aren't duplicate titles (§1.4). Paginated
  pages stay `index,follow` — never noindex them (it breaks the crawl chain, §1.2).
- **JSON-LD, single source.** On a post we emit Yoast's `seo.schema` graph when present
  (it already contains Article + BreadcrumbList + Person + Organization, cross-linked);
  only when Yoast supplies nothing do we build our own Article + BreadcrumbList. Never
  both (§1.6). Requires WP `home` → frontend URL (provision.sh) so Yoast's graph URLs are
  frontend URLs. `<` is escaped in every JSON-LD block (§1.7).
- **Sitemap** lists every post at `/blog/<slug>` (`src/app/sitemap.ts`).

## Security / content

Post HTML is sanitized via `src/lib/sanitize.ts` (allow-list, server-side; never raw into
`dangerouslySetInnerHTML`). The allow-list permits prose + images + **embeds from YouTube/
Vimeo only**, drops `javascript:`/`data:` URLs, and adds `rel="noopener noreferrer"` to
`target="_blank"` links. Reading time = `ceil(words/200)` from the rendered content.

## Offline / mock

`src/lib/cms/mock/blog.ts` seeds 14 posts across 3 categories + 5 tags + 2 authors, so
`pnpm build` (or `CMS_MODE=mock pnpm dev`) renders every route with no WordPress
(ADR 0013). Delete it once real WP content exists.

## Known follow-ups (research doc, lower priority)

- Rewrite WP-backend-domain links inside post content to root-relative (needs the per-site
  WP host) — until then rely on WP `home` → frontend.
- Optional: a table of contents for long posts; a `/blog/search` route (the cms `search`
  param + filter UI hook are already wired).
- Repo-wide: migrate `next/image` `priority` → `fetchPriority` (Next 16 deprecation) — not
  blog-specific; the whole repo uses `priority`.
