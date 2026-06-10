---
name: graphql-queries
description: How this site reads content — graphql-request server reads, the committed schema, codegen client-preset, query fragments, and the ACF flexible-content → GraphQL union mapping. Read before writing or changing a GraphQL query, adding a block's fields, or running codegen.
---

# graphql-queries — the content read layer

WPGraphQL is the **sole content layer** (ADR 0013): no REST, no fallback content. The rest of the app reads content through **one public API** and nothing else.

## The public boundary — `src/lib/cms/index.ts`

`@/lib/cms` exports exactly `getPage(slug)` and `getPages()` (+ the `Page`/`CmsBlock` types and `PAGES_TAG`). **Nothing outside `src/lib/cms/` may import anything deeper** — `cmsRequest`, the generated documents, adapters, and WP shapes are all internal. This is enforced by `eslint-plugin-boundaries` (`cms-public` → `cms-internal` only). If a component needs content, it gets it as validated props from `<BlockRenderer>` — blocks never fetch.

```ts
// the only two reads in the codebase
export async function getPage(slug: string): Promise<Page | null>  // null → caller notFound()
export async function getPages(): Promise<Page[]>                  // drives generateStaticParams + sitemap
```

## Server reads via `graphql-request` (ADR 0007)

`src/lib/cms/client.ts` → `cmsRequest(document, variables, tags)` is the single transport. It:
- uses `graphql-request`'s `GraphQLClient` server-side (marketing sites render SSG/ISR — fetch at build/server time, no browser→WP),
- tags every fetch with `next: { tags }` for on-demand ISR (see the `revalidation` skill),
- transparently serves the **dev mock** when `WPGRAPHQL_URL` is unset or `CMS_MODE=mock` (see the `mock-dev` skill).

**Client-side reads** (search, filters, cart) are opt-in only and go through TanStack Query → Server Actions / route handlers — **never browser → WP**. Not present in the base template; add it the day a page needs interactive reads.

## The schema is the contract — codegen, not hand-written types

- **Committed SDL:** `src/lib/cms/schema.graphql`. Codegen runs against this local file, so `pnpm codegen` and `pnpm build` work with **no live WordPress**.
- **Regenerate the SDL per project** once ACF fields are defined in real WP:
  ```
  pnpm dlx get-graphql-schema "$WPGRAPHQL_URL" > src/lib/cms/schema.graphql
  pnpm codegen        # commit BOTH files
  ```
- **Codegen config** (`codegen.ts`): `@graphql-codegen/client-preset`, documents glob `src/lib/cms/queries/**/*.graphql`, output `src/lib/cms/generated/`. Never hand-write Zod for CMS shapes — the generated `TypedDocumentNode`s carry the types.

## Query files

Live in `src/lib/cms/queries/*.graphql` (e.g. `page-by-slug.graphql`, `all-pages.graphql`). Operations are imported as generated documents (`PageBySlugDocument`, `AllPagesDocument`) and passed to `cmsRequest`. After editing any `.graphql` file, run `pnpm codegen` then `pnpm typecheck`.

## ACF flexible content → typed GraphQL union (the key pattern)

ACF Flexible Content (the page `blocks` field) surfaces as a **GraphQL union**, one member per layout, via `wpgraphql-acf`. Each layout must have **"Show in GraphQL" on + a pinned GraphQL Type Name**.

In the query you select each member with an inline fragment, **aliasing WPGraphQL's camelCase back to the schema's snake_case** so it matches the block schema 1:1:

```graphql
... on Page_Pagefields_Blocks_Hero {
  eyebrow
  heading
  cta_label: ctaLabel       # camelCase from WPGraphQL → snake_case the block expects
  cta_url: ctaUrl
  tone
}
```

Then `src/lib/cms/adapters/blocks.ts` maps each union member to its registry key — and the `LAYOUT` map is **exhaustive over the union**, so codegen + typecheck won't pass until you add the new member:

```ts
const LAYOUT = { Page_Pagefields_Blocks_Hero: "hero", /* … */ } as const;
```

## Adding a block's fields (the GraphQL half — see `/new-block` for the rest)

1. Add the fragment `... on Page_Pagefields_Blocks_<Layout> { … }` to `page-by-slug.graphql`, aliasing camelCase→snake_case.
2. Add the `Page_Pagefields_Blocks_<Layout> → "<layout>"` entry to the `LAYOUT` map in `adapters/blocks.ts`.
3. `pnpm codegen && pnpm typecheck` — both must be green.

## Don't

- Don't import from `src/lib/cms/generated/` or `client.ts` outside `src/lib/cms/` — boundary lint will fail.
- Don't add a REST call or a content fallback — ADR 0013 forbids both. Develop without WP via the mock.
- Don't hand-author types for CMS data — regenerate from the schema.
