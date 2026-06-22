import { siteConfig } from "../../../../../site.config";

const SITE = siteConfig.url.replace(/\/$/, "");

// BreadcrumbList structured data (SEO — the brief leans on organic discovery). Absolute item
// URLs from the canonical frontend origin (never the WP origin), matching structured-data.tsx.
export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
