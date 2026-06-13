# Draft preview

Lets an editor see **unpublished / just-saved** WordPress content on the live frontend before
it's published. Boilerplate checklist §4.

## What ships (the scaffold)

- **`/api/preview`** — validates `?secret=<PREVIEW_SECRET>`, enables Next `draftMode()` (sets a
  signed cookie), and redirects to the requested `?slug=`. Only internal redirects are allowed.
- **`/api/exit-preview`** — clears draft mode and redirects back.
- **`getPage(slug, { preview })` / `cmsRequest(..., { preview })`** — preview reads bypass the ISR
  cache (`cache: "no-store"`, `next.revalidate: 0`) so the editor always sees fresh content.

Point WordPress's "Preview" link at:

```
https://<frontend>/api/preview?secret=<PREVIEW_SECRET>&slug=/the/page/path
```

Set `PREVIEW_SECRET` in the frontend environment (Vercel). Never commit it.

## What's still required to view drafts (the remaining setup)

This is a **scaffold** — two pieces need wiring per project, both currently held as NEEDS-SETUP:

1. **A dynamic render path.** Content pages are **SSG** by default (`export const dynamic =
   "error"` in `app/[...slug]/page.tsx` + `app/page.tsx`) — the resilience rule (ISR serves
   last-good; content is never SSR'd). A statically-generated page will **not** read the draft
   cookie. To actually render drafts, add a **dynamic** preview route that reads
   `draftMode().isEnabled` and calls `getPage(slug, { preview: isEnabled })`, e.g.:

   ```tsx
   // app/preview/[...slug]/page.tsx
   export const dynamic = "force-dynamic";
   import { draftMode } from "next/headers";
   import { getPage } from "@/lib/cms";
   import { BlockRenderer } from "@/blocks/block-renderer";

   export default async function PreviewPage({ params }) {
     const { slug } = await params;
     const { isEnabled } = await draftMode();
     const page = await getPage(slug.join("/"), { preview: isEnabled });
     if (!page) return null;
     return <BlockRenderer blocks={page.blocks} />;
   }
   ```

   Then `/api/preview` should redirect to `/preview/<path>` instead of `/<path>`. Keeping preview
   on a separate route preserves the static guarantee for real visitors.

2. **Authenticated WP draft reads.** Draft posts are **not public** — fetching a draft body needs
   an **authenticated** WPGraphQL request (a WP application password, sent as a Basic-auth header
   on the preview fetch). Add that header in `cmsRequest` when `opts.preview` is set, behind a
   `WP_PREVIEW_AUTH` env. Until that credential exists, the preview path fetches published content
   uncached (useful for "see my just-saved published edit immediately", not true drafts).

When both are wired, flip checklist §4 to ✅.
