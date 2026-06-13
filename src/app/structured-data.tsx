import { siteConfig } from "../../site.config";

// Server-rendered JSON-LD (workflow/04 §4) — must be in the initial HTML;
// AI crawlers don't execute JavaScript.

// ⚠️ SELF-SERVING REVIEW MARKUP IS BANNED HERE. Never add `aggregateRating` or a
// `review` array to this Organization (or a LocalBusiness) node: Google rules
// self-serving review markup INELIGIBLE for star results, and an embedded review
// widget counts as self-serving too (research/eeat §D2; docs/seo.md §Structured-data
// policy). Review/AggregateRating belong ONLY on Product/Recipe/Book/Course/Event/
// Movie/SoftwareApplication with genuine first-party reviews (e.g. a Woo product).
// Testimonials render as plain HTML (the reviews block) — no rating markup.
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.footer.company,
  url: siteConfig.url,
  brand: { "@type": "Brand", name: siteConfig.name },
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
};

export function StructuredData() {
  return (
    <>
      {[organization, website].map((schema) => (
        <script
          key={String(schema["@type"])}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
