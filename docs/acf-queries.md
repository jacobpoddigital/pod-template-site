# ACF query cookbook

How an ACF field becomes a typed value in a React component, **one worked example per
field type**, plus the named-fragment library and where the real query files live.

This is the copy-paste reference the boilerplate assessment §2 asked for. The architecture
it documents: `graphql-request` (server reads) + GraphQL-codegen (typed) + a per-block zod
parse at the adapter boundary (ADR 0007 / 0013). No Apollo, no URQL, no REST.

> **Naming caveat (read once).** The committed `schema.graphql` is a hand-authored offline
> mock that uses the **`Page_Pagefields_Blocks_<Layout>`** convention so `pnpm codegen` and
> `pnpm build` run with no live WordPress. Live **wpgraphql-acf 2.x** emits different names
> (`PageFieldsBlocks<Layout>Layout`) and wraps image fields in a connection edge — you
> **regenerate the SDL per project** (`pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" >
> src/lib/cms/schema.graphql` → `pnpm codegen`). The field *selections* below are unchanged
> by the regen; only the type names and the image wrapper differ. See `standards.md §12` and
> `docs/images.md`.

---

## The pipeline (every field type follows it)

```
ACF field (WordPress)
  → WPGraphQL exposes it (camelCase)
  → a .graphql operation selects it (aliased back to snake_case)
  → pnpm codegen → typed TypedDocumentNode + result type
  → cmsRequest() sends it (src/lib/cms/client.ts)
  → an adapter maps the result to { layout, data } (src/lib/cms/adapters/blocks.ts)
  → the block's zod schema PARSES data at render (src/blocks/<name>/schema.ts)
  → the React component receives typed props
```

The single rule that keeps blocks decoupled from the transport: **the query aliases
WPGraphQL's camelCase back to the snake_case names the zod schema expects**
(`cta_label: ctaLabel`). So the adapter stays generic and block schemas never learn GraphQL.

---

## One example per field type

All examples are real selections from `src/lib/cms/queries/page-by-slug.graphql` — one inline
fragment per registered block on the ACF Flexible Content union.

### Text / textarea / WYSIWYG → `String`

```graphql
... on Page_Pagefields_Blocks_Hero {
  eyebrow            # ACF text     → String (optional)
  heading            # ACF text     → String (required)
  subheading         # ACF textarea → String
}
```

```ts
// src/blocks/hero/schema.ts — empty optional text comes back as ACF null, so .nullish()
export const heroSchema = z.object({
  ...sectionSettingsFields,
  eyebrow: z.string().nullish(),
  heading: z.string().min(1),      // required → no .nullish()
  subheading: z.string().nullish(),
});
```

A WYSIWYG/`content` field is the same `String`, but it carries **HTML** — render it through
the sanitiser, never raw (`standards.md §11`: `sanitize-html`, never `dangerouslySetInnerHTML`
without it). See the `rich_text` block.

### Image → `MediaItem` (use the `MediaItemFields` fragment)

```graphql
... on Page_Pagefields_Blocks_MediaText {
  heading
  image { ...MediaItemFields }     # ACF image → MediaItem
}
```

```ts
// src/lib/media.ts — ONE shared shape so every image field parses identically
export const imageSchema = z.object({
  sourceUrl: z.string(),
  altText: z.string().nullish(),
  mediaDetails: z.object({ width: z.number().nullish(), height: z.number().nullish() }).nullish(),
}).nullish();
```

Feed it straight to `next/image` (`docs/images.md` is the worked `<Image>` example).
**On live wpgraphql-acf 2.x** an ACF image is a connection edge — query
`image { node { ...MediaItemFields } }` and flatten `.node` in the adapter.

### Repeater → a list of objects

```graphql
... on Page_Pagefields_Blocks_Faq {
  heading
  items {            # ACF repeater
    question         #   sub-field (text)
    answer           #   sub-field (textarea)
  }
}
```

```ts
// src/blocks/faq/schema.ts — THE empty-repeater quirk:
// WPGraphQL returns `false` (not []) for an empty ACF repeater → .nullish() on the array.
export const faqSchema = z.object({
  ...sectionSettingsFields,
  heading: z.string().nullish(),
  items: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).nullish(),
});
```

A repeater carrying an image sub-field reuses the same fragment:
`features { title body icon }`, `cards { title body image { ...MediaItemFields } }`.
**Repeater field names must be UNIQUE across layouts** — wpgraphql-acf 2.x names repeater
types generically (`PageFieldsBlocksItems`), so two layouts with an `items` repeater collide
(`standards.md §12`).

### Flexible Content → a GraphQL union (the whole page model)

The page itself is one ACF Flexible Content field. It resolves to a union; each layout is one
member; the query lists one inline fragment per registered block:

```graphql
query PageBySlug($slug: ID!) {
  page(id: $slug, idType: URI) {
    pageFields {
      blocks {                              # ACF flexible content → union
        __typename                          # ← the discriminant the adapter maps
        ... on Page_Pagefields_Blocks_Hero { heading … }
        ... on Page_Pagefields_Blocks_Faq  { heading items { … } }
        # … one fragment per block
      }
    }
  }
}
```

```ts
// src/lib/cms/adapters/blocks.ts — __typename → registry key, exhaustive by construction
const LAYOUT: Record<BlockNode["__typename"], string> = {
  Page_Pagefields_Blocks_Hero: "hero",
  Page_Pagefields_Blocks_Faq: "faq",
  // …adding a block won't typecheck until it's mapped here
};
```

`BlockRenderer` then `registry[layout].schema.parse(data)` — bad CMS content fails **loud** at
build/ISR, never silently renders wrong. Adding a block is the `/new-block` skill: add the
inline fragment here, the `LAYOUT` entry, the schema, and the component.

### Other scalar field types

| ACF type | GraphQL | zod | Example |
|---|---|---|---|
| true/false | `Boolean` | `z.boolean().nullish()` | `socialInHeader`, the `reverse` flip toggle |
| number | `Float`/`Int` | `z.number().nullish()` | `columns`, `count`, review `rating` |
| select / button group | `String` (✱) | `z.enum([...]).nullish()` | `media_position`, `media_ratio`, `layout` |
| url / link | `String` | `z.string().nullish()` | `cta_url`, `link_url: linkUrl` |
| relationship / post object | a connection | select `{ nodes { … } }` | see `getRelatedPosts` (`docs/seo.md §Content relationships`) |

✱ **Gotcha:** wpgraphql-acf 2.x exposes an ACF `select` as a **list** (`[String]`), not a
scalar. For a single-value select use a `text` field + `z.enum` validation, or read
`[0]`. The widget-slot field does exactly this (`standards.md §12`).

---

## The query files (copy from source)

The operations are real files under `src/lib/cms/queries/` — copy from there, they're the
source of truth (codegen runs over `**/*.graphql`):

| File | What it selects |
|---|---|
| `page-by-slug.graphql` | A page + its SEO + the **flexible-content block union** (one fragment per block) |
| `site-chrome.graphql` | Header/footer chrome — menus + `siteOptions` (see `docs/navigation.md`) |
| `all-pages.graphql` / `all-posts.graphql` | Slugs for `generateStaticParams` + the sitemap |
| `blog-posts.graphql` / `post-by-slug.graphql` | The standard blog (`docs/blog.md`) |
| `recent-posts.graphql` | The `post_grid` listing block (optional category filter) |
| `case-study-by-slug.graphql` / `case-studies.graphql` | The worked **custom post type** (`docs/custom-post-types.md`) |
| `author-by-slug.graphql`, `category-by-slug.graphql`, `tag-by-slug.graphql` | Blog archives |
| `fragments/media.graphql` | The **`MediaItemFields`** named fragment (below) |

---

## Named fragments (reusable ACF groups)

Fragment files live in `src/lib/cms/queries/fragments/` and are picked up by the same codegen
glob, so **any operation in the folder can spread them**. Codegen runs with
`fragmentMasking: false` (`codegen.ts`), so a spread fragment's fields **inline into the
operation's result type** — `node.image.sourceUrl` stays directly readable and the mock
fixtures stay plain literals (this architecture reads fields off the result; it does not use
the urql/apollo masking workflow).

The library today is **`MediaItemFields`** — the ACF image shape, reused ~24× across the block
union and on every post `featuredImage`. Edit the image selection in **one** place:

```graphql
# src/lib/cms/queries/fragments/media.graphql
fragment MediaItemFields on MediaItem {
  sourceUrl
  altText
  mediaDetails { width height }
}
```

```graphql
# any operation — flat ACF image (committed schema)
image { ...MediaItemFields }
# core featuredImage / live 2.x ACF image — wrap in the connection edge
featuredImage { node { ...MediaItemFields } }
```

**When to add another fragment.** Extract a named fragment when the **same selection on the
same GraphQL type** repeats across operations — e.g. a project that exposes a genuinely shared
ACF clone/group field as its own type, or a `PostListItem` card shape reused by the blog index,
related-posts, and author archives. Note that the per-section `section_settings` scalars
(`tone`/`spacing`/`container`/`anchor`) **cannot** be one fragment — they're declared
individually on each block layout type, not on a shared interface, so they're repeated inline
per fragment by design.

After adding or editing a fragment: `pnpm codegen` then `pnpm typecheck`.

---

*Related: `docs/conditional-rendering.md` (rendering optional/variant fields),
`docs/navigation.md` (the chrome query), `docs/images.md` (ACF image → `<Image>`),
`standards.md §12` (live-WP wpgraphql-acf 2.x naming + the regen step).*
