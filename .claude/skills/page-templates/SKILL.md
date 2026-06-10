---
name: page-templates
description: How pages render — SSG/ISR-first with dynamic="error", no page-level "use client", generateStaticParams from getPages(), and the BlockRenderer/registry composition. Read before adding or changing a route, page.tsx, or the block renderer.
---

# page-templates — the rendering contract

Marketing sites are **static-first**: pages are generated at build time and refreshed on-demand via cache tags (see the `revalidation` skill). SSR on content pages is a defect, not an option.

## The hard rules

1. **`export const dynamic = "error"`** on every content page (`src/app/page.tsx`, `src/app/[...slug]/page.tsx`). This makes Next.js **error at build** if anything forces dynamic rendering — it's the guardrail that keeps pages static. Catch-all routes also set `export const dynamicParams = false` (only pre-generated params render).
2. **No page-level `"use client"`.** Pages are server components that fetch content and render blocks. Interactivity lives in client *islands* inside `src/ui/` or a block — never by making a whole page client.
3. **Pages don't fetch WP directly** — they call `getPage` / `getPages` from `@/lib/cms` (the only content boundary; see `graphql-queries`).

## A page, end to end

```tsx
// src/app/[...slug]/page.tsx
export const dynamic = "error";
export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await getPages();
  return pages.filter((p) => p.slug !== "home").map((p) => ({ slug: [p.slug] }));
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  if (!page) notFound();
  return { title: page.title, alternates: { canonical: `/${slug.join("/")}` } };
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  if (!page) notFound();                 // null page → 404, never a fallback
  return <BlockRenderer blocks={page.blocks} />;
}
```

The home route (`src/app/page.tsx`) is the same shape with a fixed `getPage("home")`.

## Composition: BlockRenderer + registry

A page is **just an ordered list of blocks**. `<BlockRenderer>` (`src/blocks/block-renderer.tsx`) maps each ACF flexible-content row to its registered block and **zod-parses the data at render** — `lib/cms` validates only the envelope, so bad content **fails loud at build/ISR**, never renders wrong silently. An unregistered layout throws with the fix in the message.

`src/blocks/registry.tsx` is `{ "<acf_layout>": defineBlock(schema, Component) }`, one entry per block, keyed to the `acf_fc_layout` value. `defineBlock` pins a component to its schema so props and parsed data can't drift. Add blocks via `/new-block`.

## Layout & boundaries

`src/app/` is **thin composition only** — it may import `blocks`, `layout`, `ui`, and the `lib/cms` public API (boundary lint enforces this). Don't put data-shaping or WP knowledge in a page; that belongs in `lib/cms`. Shared chrome (header/footer/nav) lives in `src/layout/`.

## Revalidation hook

There's no time-based `export const revalidate` — freshness is **on-demand** via `revalidateTag` keyed to the tags `getPage`/`getPages` attach. See the `revalidation` skill before changing cache behaviour.

## Don't

- Don't add `"use client"` to a `page.tsx` or `layout.tsx`.
- Don't remove `dynamic = "error"` to "fix" a build error — the build error means you introduced dynamic rendering; fix that instead.
- Don't render a fallback when `getPage` returns null — call `notFound()` (ADR 0013: no fallback content).
