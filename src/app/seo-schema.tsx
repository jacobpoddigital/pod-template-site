// Per-page JSON-LD from Yoast (seo.schemaRaw — Yoast's schema graph: WebPage,
// BreadcrumbList, Article/Organization, etc.). Server-rendered into the initial HTML
// so AI crawlers + search engines parse it without running JS (workflow/04 §4, GEO).
// schemaRaw is JSON FROM WORDPRESS (trusted), but we still escape `<` so a stray
// "</script>" in any string can't break out of the tag.
export function SeoSchema({ raw }: { raw?: string | null }) {
  if (!raw) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: raw.replace(/</g, "\\u003c") }}
    />
  );
}
