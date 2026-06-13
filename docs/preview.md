# Draft preview

Lets an editor see **unpublished / just-saved** WordPress content on the live frontend before
it's published. Boilerplate checklist §4.

## What ships (now a working flow, not just a scaffold)

- **`/api/preview`** — validates `?secret=<PREVIEW_SECRET>`, enables Next `draftMode()` (signed
  cookie), and redirects to the **dynamic** `/preview/<path>` route (internal-only).
- **`/api/exit-preview`** — clears draft mode and redirects back.
- **`app/preview/[...slug]/page.tsx`** — a `force-dynamic`, `noindex` route that reads
  `draftMode().isEnabled` and renders via `getPage(path, { preview: isEnabled })` + the block
  registry, with an "Exit preview" banner. **Deliberately separate** from the SSG content route
  (`app/[...slug]`) so real visitors keep the static/ISR guarantee — only this route is dynamic.
- **`getPage(slug, { preview })` / `cmsRequest(..., { preview })`** — preview reads bypass the ISR
  cache (`cache: "no-store"`, `revalidate: 0`) **and send WP Basic auth** when previewing (the
  `WP_APP_USER`/`WP_APP_PASSWORD` application password), so draft bodies are fetchable.

Point WordPress's "Preview" link at:

```
https://<frontend>/api/preview?secret=<PREVIEW_SECRET>&slug=/the/page/path
```

Set `PREVIEW_SECRET` in the frontend environment (Vercel). Never commit it.

## Remaining per-project setup to flip §4 fully green

The whole code path ships. Two project-level pieces remain (both verifiable only against a live
authenticated WP):

1. **The WP application password** — set `WP_APP_USER` + `WP_APP_PASSWORD` (the same app-password
   used for write ops; generate via WP-CLI, see CLAUDE.md). Without it, the preview route still
   works but fetches uncached **published** content ("see my just-saved published edit now"), not
   true drafts.
2. **Draft resolution WP-side** — confirm the page query resolves a draft by URI for an
   authenticated request (WPGraphQL exposes draft/preview nodes to authorised users; depending on
   setup a draft may need `asPreview`/the preview revision id). Verify on a real draft, then flip
   checklist §4 to ✅.
