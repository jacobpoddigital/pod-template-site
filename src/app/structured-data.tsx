import type { SiteChrome } from "@/lib/cms";
import { siteConfig } from "../../site.config";

// Server-rendered site-wide JSON-LD (workflow/04 §4 + E-E-A-T §B1) — must be in the
// initial HTML; AI crawlers don't execute JS. Emitted ONCE as a @graph from layout.tsx.
//
// SINGLE @id (Yoast reconciliation): our Organization uses Yoast's node convention
// `${frontendUrl}/#organization`. Provision sets WP `home` → the frontend origin, so
// Yoast's per-page graph emits its Organization/publisher at the SAME @id — Google
// merges them into one entity and ours augments it (legalName/founders/vatID). Configure
// Yoast as an "Organization" (not Person) with matching name + logo (docs/seo.md).

const SITE = siteConfig.url.replace(/\/$/, "");
export const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;

// ⚠️ REVIEW MARKUP IS TYPE-IMPOSSIBLE HERE. This shape has NO `review`/`aggregateRating`
// keys: self-serving review markup on Organization/LocalBusiness is INELIGIBLE for star
// results and an embedded widget counts as self-serving too (research/eeat §D2;
// docs/seo.md §Structured-data policy). Ratings belong ONLY on a future productSchema()
// for Product/Recipe/Book/Course/Event/Movie/SoftwareApplication with first-party reviews.
interface OrganizationSchema {
  "@type": string;
  "@id": string;
  name: string;
  url: string;
  legalName?: string;
  foundingDate?: string;
  vatID?: string;
  taxID?: string;
  email?: string;
  logo?: string;
  image?: string;
  description?: string;
  sameAs?: string[];
  telephone?: string;
  address?: string;
  contactPoint?: { "@type": "ContactPoint"; contactType: string; telephone?: string; email?: string };
  founder?: { "@type": "Person"; name: string; url?: string; sameAs?: string[] }[];
  brand?: { "@type": "Brand"; name: string };
}

const org = siteConfig.organization;
const v = (s?: string | null) => s || undefined;

function pickSameAs(chrome: SiteChrome): string[] | undefined {
  const list = org.sameAs.length ? [...org.sameAs] : chrome.social.map((s) => s.href).filter(Boolean);
  return list.length ? list : undefined;
}

function pickFounders(): OrganizationSchema["founder"] {
  if (!org.founders.length) return undefined;
  return org.founders.map((f) => ({ "@type": "Person" as const, name: f.name, url: f.url, sameAs: f.sameAs }));
}

function pickContactPoint(telephone?: string): OrganizationSchema["contactPoint"] {
  if (!telephone && !org.email) return undefined;
  return { "@type": "ContactPoint", contactType: org.contactType, telephone, email: v(org.email) };
}

export function buildOrganization(chrome: SiteChrome): OrganizationSchema {
  const logo = org.logoUrl ?? chrome.logo?.sourceUrl ?? undefined;
  const telephone = chrome.phoneNumbers[0]?.number || undefined;
  return {
    "@type": org.type,
    "@id": ORG_ID,
    name: siteConfig.footer.company,
    url: SITE,
    legalName: v(org.legalName),
    foundingDate: v(org.foundingDate),
    vatID: v(org.vatId),
    taxID: v(org.taxId),
    email: v(org.email),
    logo,
    image: logo,
    description: siteConfig.description,
    sameAs: pickSameAs(chrome),
    telephone,
    address: org.addressText ?? chrome.footer.address ?? undefined,
    contactPoint: pickContactPoint(telephone),
    founder: pickFounders(),
    brand: { "@type": "Brand", name: siteConfig.name },
  };
}

// Site-wide graph: the canonical Organization + the WebSite (publisher → org @id).
// `<` is escaped so a stray "</script>" in any CMS-sourced string can't break out.
export function StructuredData({ chrome }: { chrome: SiteChrome }) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganization(chrome),
      { "@type": "WebSite", "@id": WEBSITE_ID, name: siteConfig.name, url: SITE, description: siteConfig.description, publisher: { "@id": ORG_ID } },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
  );
}
