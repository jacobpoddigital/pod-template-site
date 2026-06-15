// DEV-ONLY case-study mock (ADR 0013 amendment — dev mock, NOT shipped fallback
// content). The example CUSTOM POST TYPE rendered with no WordPress: enough entries
// to fill the index grid, each with the ACF `caseStudyFields` group (client, industry,
// summary, metrics, websiteUrl), a rendered `content` body, featured image and Yoast
// `seo`. Per project: delete this + point WPGRAPHQL_URL at real WP. Plain objects, cast
// in mock/index.ts — mirrors mock/blog.ts.

const body = (client: string, summary: string) => `
<p>${client} came to us with ${summary.toLowerCase()} We started with a measurement
audit, then rebuilt the funnel around the moments that actually moved revenue.</p>
<h2>The challenge</h2>
<p>Tracking was incomplete, the site was slow on mobile, and paid spend could not be
tied back to qualified pipeline. Decisions were being made on gut feel.</p>
<h2>What we did</h2>
<ul>
<li>Rebuilt analytics on GA4 + server-side tagging with Consent Mode v2.</li>
<li>Shipped a headless front end — Core Web Vitals into the green across the board.</li>
<li>Restructured campaigns around the highest-intent queries and audiences.</li>
</ul>
<h2>The result</h2>
<p>Within two quarters the numbers below were not just up — they were finally
<em>trustworthy</em>, which changed how the whole team invested budget.</p>
`;

export interface MockCaseStudy {
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  date: string;
  modified: string;
  excerpt: string;
  content: string;
  featuredImage: { node: { sourceUrl: string; altText: string; mediaDetails: { width: number; height: number } } };
  caseStudyFields: {
    client: string;
    industry: string;
    summary: string;
    websiteUrl: string;
    metrics: { label: string; value: string }[];
  };
  seo: null;
}

interface Seed {
  databaseId: number;
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  metrics: { label: string; value: string }[];
}

const make = (s: Seed): MockCaseStudy => ({
  databaseId: s.databaseId,
  title: s.title,
  slug: s.slug,
  uri: `/case-study/${s.slug}`,
  date: "2026-05-01T09:00:00",
  modified: "2026-05-12T09:00:00",
  excerpt: `<p>${s.summary}</p>`,
  content: body(s.client, s.summary),
  featuredImage: {
    node: {
      sourceUrl: `https://picsum.photos/seed/cs-${s.slug}/1600/900`,
      altText: `${s.client} case study`,
      mediaDetails: { width: 1600, height: 900 },
    },
  },
  caseStudyFields: { client: s.client, industry: s.industry, summary: s.summary, websiteUrl: `https://example.com/${s.slug}`, metrics: s.metrics },
  seo: null,
});

const seeds: Seed[] = [
  {
    databaseId: 101,
    slug: "northwind-ecommerce-rebuild",
    title: "Rebuilding Northwind's storefront for speed and scale",
    client: "Northwind Trading",
    industry: "Ecommerce",
    summary: "Mobile checkout was leaking revenue and paid social could not be attributed.",
    metrics: [
      { label: "Mobile conversion", value: "+38%" },
      { label: "Largest Contentful Paint", value: "1.2s" },
      { label: "ROAS", value: "4.1x" },
    ],
  },
  {
    databaseId: 102,
    slug: "harbor-clinic-local-seo",
    title: "How Harbor Clinic tripled organic enquiries",
    client: "Harbor Clinic",
    industry: "Healthcare",
    summary: "Local visibility was flat and the booking journey was invisible to search.",
    metrics: [
      { label: "Organic enquiries", value: "+212%" },
      { label: "Local pack rankings", value: "Top 3" },
      { label: "Cost per enquiry", value: "−47%" },
    ],
  },
  {
    databaseId: 103,
    slug: "atlas-saas-paid-pipeline",
    title: "Atlas: paid media that finally tied to pipeline",
    client: "Atlas Software",
    industry: "B2B SaaS",
    summary: "Lead volume looked healthy but none of it could be traced to revenue.",
    metrics: [
      { label: "Qualified pipeline", value: "+£1.4M" },
      { label: "Cost per SQL", value: "−33%" },
      { label: "Attributable spend", value: "100%" },
    ],
  },
  {
    databaseId: 104,
    slug: "verde-retail-cro",
    title: "Verde Retail's conversion-rate turnaround",
    client: "Verde Retail",
    industry: "Retail",
    summary: "High traffic, low conversion, and a homepage nobody could agree on.",
    metrics: [
      { label: "Conversion rate", value: "+29%" },
      { label: "Average order value", value: "+11%" },
      { label: "Experiments shipped", value: "24" },
    ],
  },
  {
    databaseId: 105,
    slug: "meridian-email-revenue",
    title: "Meridian's email programme, rebuilt around revenue",
    client: "Meridian Group",
    industry: "Professional services",
    summary: "A large list, weak segmentation, and email treated as an afterthought.",
    metrics: [
      { label: "Email revenue", value: "+63%" },
      { label: "Open rate", value: "41%" },
      { label: "List churn", value: "−18%" },
    ],
  },
];

export const mockCaseStudies: MockCaseStudy[] = seeds.map(make);
