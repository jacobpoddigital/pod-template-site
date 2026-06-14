import { siteConfig } from "../../../../site.config";
import { SeoSchema } from "../../seo-schema";
import { ORG_ID } from "../../structured-data";
import type { CaseStudy } from "@/lib/cms";

// Case-study JSON-LD (the example CPT). If Yoast supplied a schema graph
// (seo.schemaRaw) we emit THAT and nothing else (single source, no duplicate node).
// Otherwise we build an Article from the normalized entry so the CPT ships valid
// structured data with no SEO plugin — same fallback contract as the blog.

const SITE = siteConfig.url.replace(/\/$/, "");
const abs = (path: string) => (path.startsWith("http") ? path : `${SITE}${path}`);

function articleData(caseStudy: CaseStudy) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: caseStudy.title,
    description: caseStudy.summary ?? undefined,
    datePublished: caseStudy.date ?? undefined,
    dateModified: caseStudy.modified ?? caseStudy.date ?? undefined,
    image: caseStudy.image?.sourceUrl ? [caseStudy.image.sourceUrl] : undefined,
    // Reference the single site-wide Organization node (one @id, no duplicate org).
    publisher: { "@id": ORG_ID },
    about: caseStudy.client ?? undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": abs(caseStudy.href) },
  };
}

export function CaseStudyJsonLd({ caseStudy }: { caseStudy: CaseStudy }) {
  if (caseStudy.seo?.schemaRaw) return <SeoSchema raw={caseStudy.seo.schemaRaw} />;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData(caseStudy)).replace(/</g, "\\u003c") }}
    />
  );
}
