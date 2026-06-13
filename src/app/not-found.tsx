import { ButtonLink } from "@/ui/button-link";

// Branded 404 (boilerplate §22 — deleted-page behaviour). Shown when a route doesn't
// resolve OR a page calls notFound() (e.g. a WP page was deleted/unpublished and no 301
// was added). If the old URL had SEO value, add a redirect instead of letting it 404 —
// see docs/seo.md §Redirects (redirect-on-delete). This page is the graceful fallback.
export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <p className="label text-ink-muted">404</p>
      <h1 className="display-md text-ink">This page can&rsquo;t be found</h1>
      <p className="body-lg max-w-[55ch] text-ink-muted">
        The page may have moved or been removed. Try the homepage or the main navigation to find
        what you&rsquo;re looking for.
      </p>
      <ButtonLink href="/">Back to home</ButtonLink>
    </section>
  );
}
