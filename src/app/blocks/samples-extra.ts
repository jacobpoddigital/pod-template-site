import type { BlockSample } from "./samples";

// Roadmap Tier-1 block samples (block-library-roadmap.md): testimonials-with-face,
// stats band, team, pricing. Kept separate from samples.ts for the max-lines cap.
export const extraSamples: BlockSample[] = [
  {
    label: "reviews (with avatars + logo)",
    block: {
      layout: "reviews",
      data: {
        heading: "Testimonials with a face",
        intro: "An avatar and an optional company logo — the cheapest credibility win.",
        tone: "muted",
        columns: 3,
        reviews: [
          { quote: "They rebuilt our funnel and doubled enquiries in a quarter.", author: "Jordan Pearce", role: "Marketing Director, Northwind", rating: 5, avatar: { sourceUrl: "https://i.pravatar.cc/96?img=12", altText: "" } },
          { quote: "Genuinely the smoothest web project we've ever run.", author: "Priya Nair", role: "Founder, Acme Studio", rating: 5, avatar: { sourceUrl: "https://i.pravatar.cc/96?img=32", altText: "" } },
          { quote: "Fast, measurable, and a joy for our team to edit.", author: "Tom Beckett", role: "Ops Lead, Globex", rating: 4 },
        ],
      },
    },
  },
  {
    label: "stats_band",
    block: {
      layout: "stats_band",
      data: {
        heading: "By the numbers",
        columns: 4,
        stats: [
          { value: "10+ yrs", label: "In business" },
          { value: "200+", label: "Sites shipped" },
          { value: "<1s", label: "Median load time" },
          { value: "98%", label: "Client retention" },
        ],
      },
    },
  },
  {
    label: "team",
    block: {
      layout: "team",
      data: {
        heading: "The people behind the work",
        columns: 4,
        members: [
          { name: "Sam Rivera", role: "Founder", bio: "Strategy and client partnerships.", linkedin_url: "#", image: { sourceUrl: "https://i.pravatar.cc/200?img=15", altText: "" } },
          { name: "Alex Chen", role: "Lead Engineer", bio: "Builds the systems that build the sites.", linkedin_url: "#", image: { sourceUrl: "https://i.pravatar.cc/200?img=51", altText: "" } },
          { name: "Maya Osei", role: "Designer", bio: "Design language and the craft bar.", website_url: "#", image: { sourceUrl: "https://i.pravatar.cc/200?img=45", altText: "" } },
          { name: "Lee Park", role: "Performance", bio: "Measurement, analytics, Core Web Vitals." },
        ],
      },
    },
  },
  {
    label: "pricing (featured + annual toggle)",
    block: {
      layout: "pricing",
      data: {
        heading: "Simple, transparent pricing",
        intro: "Pick a plan that fits — switch to annual to save.",
        tone: "muted",
        plans: [
          { name: "Starter", price: "£499", price_annual: "£4,990", description: "For a clean brochure site.", cta_label: "Choose Starter", cta_url: "#", features: [{ text: "5 pages" }, { text: "Headless WordPress" }, { text: "Core Web Vitals pass" }] },
          { name: "Growth", price: "£999", price_annual: "£9,990", description: "For marketing teams that ship.", featured: true, badge: "Most popular", cta_label: "Choose Growth", cta_url: "#", features: [{ text: "Everything in Starter" }, { text: "GA4 + server-side tagging" }, { text: "Monthly CRO pass" }, { text: "Priority support" }] },
          { name: "Scale", price: "£1,999", price_annual: "£19,990", description: "For ambitious growth programmes.", cta_label: "Talk to us", cta_url: "#", features: [{ text: "Everything in Growth" }, { text: "Dedicated strategist" }, { text: "Custom integrations" }] },
        ],
      },
    },
  },
];
