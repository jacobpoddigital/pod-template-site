import type { BlockSample } from "./samples";

// Tier-3 block samples (block-library-roadmap.md). Kept in its own file for the
// max-lines lint cap.
export const tier3Samples: BlockSample[] = [
  {
    label: "before_after",
    block: {
      layout: "before_after",
      data: {
        heading: "The redesign, side by side",
        intro: "Drag the slider to compare the old site with the rebuild.",
        before_label: "Before",
        after_label: "After",
        before_image: { sourceUrl: "https://picsum.photos/seed/before/1280/720", altText: "Before" },
        after_image: { sourceUrl: "https://picsum.photos/seed/after/1280/720", altText: "After" },
      },
    },
  },
  {
    label: "toc",
    block: {
      layout: "toc",
      data: {
        heading: "On this page",
        items: [
          { label: "What we do", target: "services" },
          { label: "Results", target: "results" },
          { label: "Pricing", target: "pricing" },
          { label: "Contact", target: "contact" },
        ],
      },
    },
  },
  {
    label: "integrations_grid",
    block: {
      layout: "integrations_grid",
      data: {
        heading: "Works with your stack",
        intro: "First-party and third-party integrations.",
        columns: 4,
        items: [
          { name: "GA4", url: "#" },
          { name: "HubSpot", url: "#" },
          { name: "Stripe", url: "#" },
          { name: "Mailchimp", url: "#" },
          { name: "Segment", url: "#" },
          { name: "Slack", url: "#" },
          { name: "Zapier", url: "#" },
          { name: "Shopify", url: "#" },
        ],
      },
    },
  },
  {
    label: "pricing_matrix",
    block: {
      layout: "pricing_matrix",
      data: {
        heading: "Compare plans in detail",
        plan_labels: [{ label: "Starter" }, { label: "Growth" }, { label: "Scale" }],
        rows: [
          { feature: "Pages", value1: "5", value2: "15", value3: "Unlimited" },
          { feature: "GA4 + tagging", value1: "—", value2: "✓", value3: "✓" },
          { feature: "Monthly CRO pass", value1: "—", value2: "✓", value3: "✓" },
          { feature: "Dedicated strategist", value1: "—", value2: "—", value3: "✓" },
          { feature: "Support SLA", value1: "48h", value2: "24h", value3: "4h" },
        ],
      },
    },
  },
  {
    label: "locations_map",
    block: {
      layout: "locations_map",
      data: {
        heading: "Find us",
        columns: 3,
        locations: [
          { name: "Leicester", address: "1 Example Street, Leicester LE1 1AA", maps_url: "#", phone: "0116 123 4567" },
          { name: "London", address: "2 Sample Road, London EC1 1BB", maps_url: "#", phone: "020 1234 5678" },
          { name: "Manchester", address: "3 Demo Lane, Manchester M1 1CC", maps_url: "#", phone: "0161 123 4567" },
        ],
      },
    },
  },
  {
    label: "video_testimonial",
    block: {
      layout: "video_testimonial",
      data: {
        heading: "Hear it from clients",
        columns: 2,
        items: [
          { video_id: "dQw4w9WgXcQ", quote: "The rebuild paid for itself in a quarter.", author: "Jordan Pearce", role: "Northwind", facade_image: { sourceUrl: "https://picsum.photos/seed/vt1/1280/720", altText: "" } },
          { video_id: "dQw4w9WgXcQ", quote: "Best web partner we've worked with, full stop.", author: "Priya Nair", role: "Acme Studio", facade_image: { sourceUrl: "https://picsum.photos/seed/vt2/1280/720", altText: "" } },
        ],
      },
    },
  },
  {
    label: "feature_rows (zig-zag)",
    block: {
      layout: "feature_rows",
      data: {
        heading: "How we work",
        intro: "Alternating rows keep a long story scannable.",
        rows: [
          { eyebrow: "Strategy", title: "We start with the goal, not the design", body: "Every build begins with the brief, the brand and the service mix — so the site is the substrate every Pod service plugs into.", cta_label: "Our process", cta_url: "#", image: { sourceUrl: "https://picsum.photos/seed/fr1/1000/600", altText: "" } },
          { eyebrow: "Build", title: "AI agents build; humans review every PR", body: "Headless WordPress, Next.js, and the block library you're looking at — assembled fast, reviewed carefully.", cta_label: "See the stack", cta_url: "#", image: { sourceUrl: "https://picsum.photos/seed/fr2/1000/600", altText: "" } },
          { eyebrow: "Measure", title: "Measurement is the product", body: "GA4, server-side tagging and dashboards on every build by default — because we're a marketing agency first.", cta_label: "How we measure", cta_url: "#", image: { sourceUrl: "https://picsum.photos/seed/fr3/1000/600", altText: "" } },
        ],
      },
    },
  },
];
