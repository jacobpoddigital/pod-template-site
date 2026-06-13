# Images — WordPress media → `next/image`

A worked example of the headless image path. The rules are in `docs/standards.md` (§6
performance, §12 the wpgraphql-acf edge gotcha); this is the end-to-end recipe.

## 1. The WP media host must be allowed

`next/image` throws at runtime on an un-allowlisted host. Add the client's WordPress / WP Engine
Atlas media host to `next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "*.wpenginepowered.com" }, // or the client's media domain
    // picsum.photos is the dev/sample placeholder only — remove for production.
  ],
},
```

Lock it to the media host — never `hostname: "*"` (§6).

## 2. ACF image fields are a CONNECTION EDGE, not a flat object

wpgraphql-acf 2.x exposes an ACF image as `AcfMediaItemConnectionEdge`. Query through `.node`:

```graphql
# ✅ correct — wpgraphql-acf 2.x
image {
  node { sourceUrl altText mediaDetails { width height } }
}

# ❌ fails codegen against live WP
image { sourceUrl altText }
```

> The committed mock SDL (`src/lib/cms/schema.graphql`) currently models `image: MediaItem`
> (flat) for the offline mock. When you **regenerate the SDL from live WP** (`codegen.ts`), ACF
> images become edges — update the block's fragment to `image { node { … } }` and flatten in the
> adapter (next step). This is part of the SDL-regen pass described in §12.

## 3. Flatten `.node` in the adapter

Keep WordPress shapes out of components — flatten in `src/lib/cms/adapters/blocks.ts` (or the
block's mapper) so the component gets a plain object:

```ts
function toImage(node?: { sourceUrl?: string | null; altText?: string | null; mediaDetails?: { width?: number | null; height?: number | null } | null } | null) {
  if (!node?.sourceUrl) return null;
  return { src: node.sourceUrl, alt: node.altText ?? "", width: node.mediaDetails?.width ?? undefined, height: node.mediaDetails?.height ?? undefined };
}
// edge → node: toImage(data.image?.node)
```

## 4. Render with `next/image`

```tsx
import Image from "next/image";

{img && (
  <Image
    src={img.src}
    alt={img.alt}            // descriptive for content images; "" only if decorative (§7)
    width={img.width}
    height={img.height}      // real dimensions from mediaDetails → no layout shift (CLS)
    sizes="(min-width: 1024px) 50vw, 100vw"  // MUST match the CSS (§6)
    priority={isLcp}         // exactly ONE per page — the LCP hero; never lazy above the fold
  />
)}
```

- `sizes` must reflect how the image actually renders, or the browser downloads the wrong size.
- `priority` on exactly one image per page (the LCP candidate). Everything else lazy-loads.
- AVIF is preferred and automatic via the optimizer; blur placeholders for heroes only (§6).
