import type { PageBySlugQuery } from "../generated/graphql";

// DEV-ONLY demo content (ADR 0013 amendment — dev mock, NOT shipped fallback
// content). A "home" page exercising all 6 starter blocks, so `pnpm dev` renders
// a real-looking page with no WordPress. Per project: edit freely, or delete this
// file + the mock once real WP content exists. This is type-checked against the
// generated PageBySlugQuery — it can't drift from the schema.

export const mockHome: PageBySlugQuery = {
  page: {
    databaseId: 1,
    title: "Home",
    slug: "home",
    uri: "/",
    pageFields: {
      blocks: [
        {
          __typename: "Page_Pagefields_Blocks_Hero",
          eyebrow: "Pod template",
          heading: "A headless WordPress starter, rendered with no backend",
          subheading:
            "This page is the dev mock — every block below is real, served from a committed schema while WordPress is offline.",
          tone: "default",
          layout: null,
          image: null,
          spacing: null,
          container: null,
          anchor: null,
          cta_label: "Get started",
          cta_url: "#",
          secondary_label: "View the blocks",
          secondary_url: "/blocks",
        },
        {
          __typename: "Page_Pagefields_Blocks_LogoStrip",
          heading: "Trusted by teams who ship",
          tone: "muted",
          spacing: null,
          container: null,
          anchor: null,
          logos: [
            { name: "Northwind" },
            { name: "Acme" },
            { name: "Globex" },
            { name: "Initech" },
            { name: "Umbrella" },
          ],
        },
        {
          __typename: "Page_Pagefields_Blocks_FeatureGrid",
          heading: "Everything wired, nothing in your way",
          intro: "The plumbing is done; the content model is yours to define.",
          tone: "default",
          spacing: null,
          container: null,
          anchor: "services",
          features: [
            { title: "GraphQL data layer", body: "graphql-request + codegen, typed end to end.", icon: "Boxes" },
            { title: "Builds offline", body: "Committed schema + dev mock — no WP needed to iterate.", icon: "PlugZap" },
            { title: "Blocks pattern", body: "One ACF layout → one registry entry → one component.", icon: "LayoutGrid" },
          ],
        },
        {
          __typename: "Page_Pagefields_Blocks_Faq",
          heading: "Common questions",
          tone: "muted",
          spacing: null,
          container: null,
          anchor: null,
          items: [
            { question: "Do I need WordPress to run this?", answer: "No — the dev mock renders blocks against the committed schema. Point WPGRAPHQL_URL at real WP when you have it." },
            { question: "How do I add a block?", answer: "Follow the /new-block recipe: ACF layout + schema + component + registry entry + a query fragment." },
          ],
        },
        {
          __typename: "Page_Pagefields_Blocks_ContactForm",
          heading: "Get in touch",
          intro: "The contact block posts through a Next.js Server Action — the writes path.",
          tone: "default",
          spacing: null,
          container: null,
          anchor: null,
          submit_label: "Send message",
          success_message: "Thanks — we'll be in touch shortly.",
        },
        {
          __typename: "Page_Pagefields_Blocks_MediaText",
          eyebrow: "Editor-controlled",
          heading: "Set spacing, width and surface in WordPress — no rebuild",
          body: "media_text composes the shared <Section>; the section_settings contract maps each editor choice to a design-system token. The image leads on mobile and swaps sides on desktop via media_position.",
          cta_label: "How it works",
          cta_url: "#",
          video_id: null,
          media_position: "right",
          media_ratio: "landscape",
          tone: "default",
          spacing: "default",
          container: "default",
          anchor: null,
          image: {
            sourceUrl: "https://picsum.photos/seed/podmock/1200/900",
            altText: "Placeholder image",
            mediaDetails: { width: 1200, height: 900 },
          },
        },
        {
          __typename: "Page_Pagefields_Blocks_StatsBand",
          heading: "By the numbers",
          intro: null,
          columns: 4,
          tone: "default",
          spacing: null,
          container: null,
          anchor: null,
          stats: [
            { value: "10+ yrs", label: "In business", description: null },
            { value: "200+", label: "Sites shipped", description: null },
            { value: "<1s", label: "Median load time", description: null },
            { value: "98%", label: "Client retention", description: null },
          ],
        },
        {
          __typename: "Page_Pagefields_Blocks_Reviews",
          heading: "What clients say",
          intro: "A face and a logo lift testimonial recall — the cheapest credibility win.",
          columns: 3,
          layout: "grid",
          tone: "muted",
          spacing: null,
          container: null,
          anchor: null,
          reviews: [
            {
              quote: "They rebuilt our site and organic traffic doubled in a quarter.",
              author: "Jordan Pearce",
              role: "Marketing Director, Northwind",
              rating: 5,
              avatar: { sourceUrl: "https://i.pravatar.cc/96?img=12", altText: "", mediaDetails: { width: 96, height: 96 } },
              company_logo: null,
            },
            {
              quote: "Genuinely the smoothest web project we've run. Everything just worked.",
              author: "Priya Nair",
              role: "Founder, Acme Studio",
              rating: 5,
              avatar: { sourceUrl: "https://i.pravatar.cc/96?img=32", altText: "", mediaDetails: { width: 96, height: 96 } },
              company_logo: null,
            },
            {
              quote: "Fast, measurable, and the editing experience is a joy for our team.",
              author: "Tom Beckett",
              role: "Ops Lead, Globex",
              rating: 4,
              avatar: null,
              company_logo: null,
            },
          ],
        },
        {
          __typename: "Page_Pagefields_Blocks_Team",
          heading: "The people behind the work",
          intro: null,
          columns: 4,
          tone: "default",
          spacing: null,
          container: null,
          anchor: null,
          members: [
            { name: "Sam Rivera", role: "Founder", bio: "Strategy and client partnerships.", linkedin_url: "https://www.linkedin.com", twitter_url: null, website_url: null, image: { sourceUrl: "https://i.pravatar.cc/200?img=15", altText: "", mediaDetails: { width: 200, height: 200 } } },
            { name: "Alex Chen", role: "Lead Engineer", bio: "Builds the systems that build the sites.", linkedin_url: "https://www.linkedin.com", twitter_url: null, website_url: null, image: { sourceUrl: "https://i.pravatar.cc/200?img=51", altText: "", mediaDetails: { width: 200, height: 200 } } },
            { name: "Maya Osei", role: "Designer", bio: "Design language and the craft bar.", linkedin_url: null, twitter_url: null, website_url: "https://example.com", image: { sourceUrl: "https://i.pravatar.cc/200?img=45", altText: "", mediaDetails: { width: 200, height: 200 } } },
            { name: "Lee Park", role: "Performance", bio: "Measurement, analytics, Core Web Vitals.", linkedin_url: "https://www.linkedin.com", twitter_url: null, website_url: null, image: null },
          ],
        },
        {
          __typename: "Page_Pagefields_Blocks_Pricing",
          heading: "Simple, transparent pricing",
          intro: "Pick a plan that fits — switch to annual to save.",
          tone: "muted",
          spacing: null,
          container: null,
          anchor: null,
          plans: [
            {
              name: "Starter", price: "£499", price_annual: "£4,990", period: null, description: "For a clean brochure site.", featured: false, badge: null, cta_label: "Choose Starter", cta_url: "#",
              features: [{ text: "5 pages" }, { text: "Headless WordPress" }, { text: "Core Web Vitals pass" }],
            },
            {
              name: "Growth", price: "£999", price_annual: "£9,990", period: null, description: "For marketing teams that ship.", featured: true, badge: "Most popular", cta_label: "Choose Growth", cta_url: "#",
              features: [{ text: "Everything in Starter" }, { text: "GA4 + server-side tagging" }, { text: "Monthly CRO pass" }, { text: "Priority support" }],
            },
            {
              name: "Scale", price: "£1,999", price_annual: "£19,990", period: null, description: "For ambitious growth programmes.", featured: false, badge: null, cta_label: "Talk to us", cta_url: "#",
              features: [{ text: "Everything in Growth" }, { text: "Dedicated strategist" }, { text: "Custom integrations" }],
            },
          ],
        },
        {
          __typename: "Page_Pagefields_Blocks_CtaBanner",
          heading: "Clone it, brand it, ship it",
          body: "Regenerate the schema from your WP, define ACF, and the same blocks render live.",
          tone: "accent",
          spacing: null,
          container: null,
          anchor: null,
          cta_label: "Read the build guide",
          cta_url: "#",
        },
      ],
    },
  },
};

// Recent posts for the post_grid block in offline/dev mode.
export const mockPosts = [
  {
    databaseId: 101,
    title: "How headless WordPress speeds up your site",
    uri: "/blog/headless-speed",
    date: "2026-06-09T09:00:00",
    excerpt: "<p>Static-first rendering and a global CDN put load times under a second.</p>",
    featuredImage: { node: { sourceUrl: "https://picsum.photos/seed/post1/800/450", altText: "" } },
  },
  {
    databaseId: 102,
    title: "Measurement-first builds for marketing teams",
    uri: "/blog/measurement-first",
    date: "2026-06-06T09:00:00",
    excerpt: "<p>GA4, server-side tagging and a clean dataLayer, on every site by default.</p>",
    featuredImage: { node: { sourceUrl: "https://picsum.photos/seed/post2/800/450", altText: "" } },
  },
  {
    databaseId: 103,
    title: "Editing your site without a developer",
    uri: "/blog/editor-control",
    date: "2026-06-02T09:00:00",
    excerpt: "<p>Section settings let editors change layout in WordPress — no rebuild.</p>",
    featuredImage: { node: { sourceUrl: "https://picsum.photos/seed/post3/800/450", altText: "" } },
  },
];

// Editor-managed chrome (header/footer) for offline/dev mode — mirrors what real WP
// menus (PRIMARY/FOOTER) + the Site Options ACF page would return. "What we do" has
// children so the mobile menu drills; footer top-level items are columns.
export const mockChrome = {
  primary: {
    nodes: [
      { id: "p1", parentId: null, label: "Home", uri: "/" },
      { id: "p2", parentId: null, label: "What we do", uri: "/#services" },
      { id: "p2a", parentId: "p2", label: "SEO", uri: "/services/seo" },
      { id: "p2b", parentId: "p2", label: "PPC", uri: "/services/ppc" },
      { id: "p2c", parentId: "p2", label: "Web design", uri: "/services/web" },
      { id: "p3", parentId: null, label: "Contact", uri: "/#contact" },
    ],
  },
  footer: {
    nodes: [
      { id: "f1", parentId: null, label: "Company", uri: "#" },
      { id: "f1a", parentId: "f1", label: "About", uri: "/about" },
      { id: "f1b", parentId: "f1", label: "Contact", uri: "/#contact" },
      { id: "f2", parentId: null, label: "Services", uri: "#" },
      { id: "f2a", parentId: "f2", label: "SEO", uri: "/services/seo" },
      { id: "f2b", parentId: "f2", label: "PPC", uri: "/services/ppc" },
    ],
  },
  siteOptions: {
    strapline: "AI-built, human-reviewed websites.",
    address: null,
    headerCtaLabel: "Get in touch",
    headerCtaUrl: "/#contact",
    logo: null,
    social: [
      { label: "LinkedIn", url: "https://www.linkedin.com" },
      { label: "Instagram", url: "https://www.instagram.com" },
      { label: "X", url: "https://x.com" },
      { label: "Facebook", url: "https://www.facebook.com" },
    ],
    socialInHeader: true,
    phoneNumbers: [
      { location: "Leicester", number: "0116 123 4567" },
      { location: "London", number: "020 1234 5678" },
    ],
  },
};
