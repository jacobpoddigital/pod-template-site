// DEV-ONLY blog mock (ADR 0013 amendment — dev mock, NOT shipped fallback content).
// Enough posts (14) to exercise /blog/page/[n] at 12/page, across 3 categories + 5
// tags + 2 authors, so the standard blog renders with no WordPress (workflow/34).
// Per project: delete this + point WPGRAPHQL_URL at real WP. Plain objects (cast in
// mock/index.ts), mirroring the existing mockPosts pattern.

interface MockTerm {
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  uri: string;
  count: number;
  categoryImage?: { sourceUrl: string; altText: string } | null;
}

export const mockCategories: MockTerm[] = [
  {
    databaseId: 11,
    name: "SEO & Content",
    slug: "seo",
    description: "Organic growth, technical SEO, and content that earns rankings — and AI citations.",
    uri: "/category/seo",
    count: 0,
    // A category banner image (Great White port) — used as the archive header background.
    categoryImage: { sourceUrl: "https://picsum.photos/seed/cat-seo/1920/640", altText: "" },
  },
  {
    databaseId: 12,
    name: "Paid Media",
    slug: "paid-media",
    description: "PPC, paid social, and conversion tracking that proves return on ad spend.",
    uri: "/category/paid-media",
    count: 0,
    categoryImage: null, // falls back to the global banner
  },
  {
    databaseId: 13,
    name: "Web & CRO",
    slug: "web",
    description: "Fast, measurable websites and the experiments that lift conversion.",
    uri: "/category/web",
    count: 0,
    categoryImage: { sourceUrl: "https://picsum.photos/seed/cat-web/1920/640", altText: "" },
  },
];

export const mockTags: MockTerm[] = [
  { databaseId: 21, name: "Headless", slug: "headless", uri: "/tag/headless", count: 0, description: "Headless WordPress + Next.js." },
  { databaseId: 22, name: "Core Web Vitals", slug: "core-web-vitals", uri: "/tag/core-web-vitals", count: 0 },
  { databaseId: 23, name: "GA4", slug: "ga4", uri: "/tag/ga4", count: 0 },
  { databaseId: 24, name: "Conversion", slug: "conversion", uri: "/tag/conversion", count: 0 },
  { databaseId: 25, name: "WordPress", slug: "wordpress", uri: "/tag/wordpress", count: 0 },
];

// Author meta mirrors the optional ACF user fields (roleTitle/teamProfileUrl/social/
// profileImage) the author archive + Person schema read — exercises the E-E-A-T path.
export const mockAuthors = [
  {
    databaseId: 1,
    name: "Sam Rivera",
    slug: "sam-rivera",
    description: "Founder at Pod Digital. Fifteen years turning marketing strategy into websites that measurably perform.",
    uri: "/author/sam-rivera",
    avatar: { url: "https://i.pravatar.cc/160?img=15" },
    roleTitle: "Founder & Strategy Director",
    teamProfileUrl: "/about#sam-rivera",
    profileImage: null,
    social: [
      { label: "LinkedIn", url: "https://www.linkedin.com" },
      { label: "X", url: "https://x.com" },
    ],
    knowsAbout: ["SEO", "Paid media", "Web strategy", "Conversion"],
  },
  {
    databaseId: 2,
    name: "Maya Osei",
    slug: "maya-osei",
    description: "Designer at Pod Digital, owner of the design language and the craft bar every build is held to.",
    uri: "/author/maya-osei",
    avatar: { url: "https://i.pravatar.cc/160?img=45" },
    roleTitle: "Lead Designer",
    teamProfileUrl: "/about#maya-osei",
    profileImage: null,
    social: [{ label: "LinkedIn", url: "https://www.linkedin.com" }],
    knowsAbout: ["Design systems", "Brand", "Accessibility"],
  },
];

// Rendered post body — real Gutenberg-style HTML so the prose container, headings,
// lists and reading-time calc all have something true to work with.
function body(title: string): string {
  return `
<p>${title} is one of the questions clients ask us most, so here is how we think about it at Pod Digital — and what we do on every build.</p>
<h2>Why it matters</h2>
<p>A marketing website is the substrate every channel plugs into. If the foundation is slow, untracked, or hard to edit, every pound spent on SEO and paid media leaks. We start from measurement and work backwards.</p>
<ul>
<li>Static-first rendering, so pages load in well under a second.</li>
<li>Clean tracking from day one — GA4, consent mode, and conversion events.</li>
<li>Content the team can edit without a developer.</li>
</ul>
<h2>How we approach it</h2>
<p>We treat the build as a system, not a one-off. Every section maps to a reusable block, every block to the design system, and the design system to the brand. That is what lets us ship by-the-book sites at a pace a hand-built site never could.</p>
<blockquote><p>The best website is the one that disappears — visitors get what they came for and convert, and the team can change it in minutes.</p></blockquote>
<h2>What to do next</h2>
<p>If you are weighing a rebuild, start by auditing what you can already measure. The gaps in your data usually point straight at the gaps in your site.</p>
`.trim();
}

const seeds: { title: string; cat: number; tags: number[]; author: number }[] = [
  { title: "How headless WordPress speeds up your site", cat: 2, tags: [0, 1], author: 0 },
  { title: "Measurement-first builds for marketing teams", cat: 1, tags: [2, 3], author: 0 },
  { title: "Editing your site without a developer", cat: 2, tags: [4], author: 1 },
  { title: "What Core Web Vitals actually reward in 2026", cat: 0, tags: [1], author: 0 },
  { title: "Writing content that earns AI citations", cat: 0, tags: [], author: 1 },
  { title: "Server-side tagging, explained for marketers", cat: 1, tags: [2], author: 0 },
  { title: "A practical guide to conversion-rate optimisation", cat: 2, tags: [3], author: 1 },
  { title: "Consent Mode v2 without tanking your data", cat: 1, tags: [2, 3], author: 0 },
  { title: "Designing landing pages that don't leak", cat: 2, tags: [3], author: 1 },
  { title: "Technical SEO for headless sites", cat: 0, tags: [0, 4], author: 0 },
  { title: "Why we render WordPress content, not rebuild it", cat: 2, tags: [0, 4], author: 1 },
  { title: "Tracking offline conversions back to the ad", cat: 1, tags: [2, 3], author: 0 },
  { title: "The case for a design system on every project", cat: 2, tags: [], author: 1 },
  { title: "Structured data, schema, and the GEO opportunity", cat: 0, tags: [4], author: 0 },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Newest first; dates step back a few days each.
export const mockBlogPosts = seeds.map((s, i) => {
  const slug = slugify(s.title);
  const day = String(28 - i).padStart(2, "0");
  const cat = mockCategories[s.cat]!;
  return {
    databaseId: 100 + i,
    title: s.title,
    slug,
    uri: `/${slug}`, // WP permalink; the frontend route is /blog/<slug>
    date: `2026-05-${day}T09:00:00`,
    modified: `2026-05-${day}T09:00:00`,
    excerpt: `<p>${s.title} — how Pod Digital approaches it on every build, and what we'd recommend you do next.</p>`,
    content: body(s.title),
    featuredImage: { node: { sourceUrl: `https://picsum.photos/seed/post-${i}/1200/675`, altText: "", mediaDetails: { width: 1200, height: 675 } } },
    author: { node: mockAuthors[s.author]! },
    categories: { nodes: [{ name: cat.name, slug: cat.slug, uri: cat.uri }] },
    tags: { nodes: s.tags.map((t) => ({ name: mockTags[t]!.name, slug: mockTags[t]!.slug, uri: mockTags[t]!.uri })) },
    seo: {
      title: `${s.title} | Pod Digital`,
      metaDesc: `${s.title} — how Pod Digital approaches it on every build.`,
      canonical: `https://wp.example.com/${slug}/`,
      metaRobotsNoindex: "index",
      metaRobotsNofollow: "follow",
      opengraphTitle: s.title,
      opengraphDescription: `${s.title} — Pod Digital's approach.`,
      opengraphImage: { sourceUrl: `https://picsum.photos/seed/post-${i}/1200/630`, altText: "", mediaDetails: { width: 1200, height: 630 } },
      twitterTitle: null,
      twitterDescription: null,
      twitterImage: null,
      schema: { raw: `{"@context":"https://schema.org","@graph":[{"@type":"Article","headline":"${s.title}"}]}` },
    },
    // A couple of posts cite sources so the "Sources" section (E-E-A-T) renders offline.
    postFields:
      i === 0 || i === 12
        ? {
            sources: [
              { label: "Core Web Vitals — web.dev", url: "https://web.dev/articles/vitals", publisher: "Google" },
              { label: "Helpful, reliable, people-first content", url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content", publisher: "Google Search Central" },
            ],
          }
        : { sources: [] },
  };
});

// Populate term post counts from the seed assignments.
for (const c of mockCategories) c.count = mockBlogPosts.filter((p) => p.categories.nodes.some((n) => n.slug === c.slug)).length;
for (const t of mockTags) t.count = mockBlogPosts.filter((p) => p.tags.nodes.some((n) => n.slug === t.slug)).length;
