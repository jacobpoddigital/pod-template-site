# Favicons & touch icons (headless)

We use **[realfavicongenerator.net](https://realfavicongenerator.net)** to produce the icon set.
In classic WordPress you drop the zip in the site root; **headless is different** — there's no
"web root" to drop into, and you do **not** paste RealFaviconGenerator's `<head>` HTML snippet.
Instead: put the files in `public/` and declare them via Next's **Metadata API**, which renders the
`<link>`/`<meta>` tags for you. Do it the same way every site (this recipe).

## Recipe

1. **Generate with a path prefix.** On realfavicongenerator.net, configure the icons, then in
   **App settings → "I will place my favicon files in a subdirectory"** set the path to **`/favicons/`**.
   This makes the generated `site.webmanifest` + browserconfig reference `/favicons/…` URLs that
   resolve once the files live there.
2. **Unzip into `public/favicons/`.** Everything from the zip — `favicon.ico`, `favicon-96x96.png`,
   `favicon.svg`, `apple-touch-icon.png`, `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`,
   `site.webmanifest`, etc. (Next serves `public/x` at `/x`.)
3. **Declare them in `src/app/layout.tsx`** — add `icons` + `manifest` to the `metadata` export
   (the block is scaffolded there, commented; uncomment + adjust filenames to match the zip):

   ```ts
   export const metadata: Metadata = {
     // …existing…
     icons: {
       icon: [
         { url: "/favicons/favicon.ico", sizes: "any" },
         { url: "/favicons/favicon.svg", type: "image/svg+xml" },
         { url: "/favicons/favicon-96x96.png", type: "image/png", sizes: "96x96" },
       ],
       apple: [{ url: "/favicons/apple-touch-icon.png", sizes: "180x180" }],
     },
     manifest: "/favicons/site.webmanifest",
   };
   ```
4. **Remove the default `src/app/favicon.ico`** if you've put a favicon.ico under `public/favicons/`
   and pointed `metadata.icons` at it — otherwise Next's app-file convention (`app/favicon.ico`) wins
   and you'll serve the placeholder. (Keeping the app/ one is fine too if you don't need the full set.)
5. **`theme-color`** comes from `export const viewport` (already set per light/dark in `layout.tsx`) —
   you don't need RealFaviconGenerator's `theme-color` meta.

## The simpler alternative (basic needs)

For just a favicon + one touch icon, skip `public/` and use Next's **file conventions**: drop
`favicon.ico`, `icon.svg` (or `icon.png`), and `apple-icon.png` directly in `src/app/` — Next
auto-detects them and emits the tags. Use the `public/favicons/` + metadata route above when you
want the **full** RealFaviconGenerator set (multiple sizes + PWA manifest).

## Verify

After adding: `curl -sI http://localhost:3000/favicons/favicon.ico` → 200, and the page `<head>`
contains the `<link rel="icon">` / `apple-touch-icon` / `manifest` tags (Next rendered them from
`metadata`).
