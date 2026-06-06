import { siteConfig } from "../../site.config";

// Server-rendered JSON-LD (workflow/04 §4) — must be in the initial HTML;
// AI crawlers don't execute JavaScript.

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
