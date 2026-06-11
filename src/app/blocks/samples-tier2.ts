import type { BlockSample } from "./samples";

// Tier-2 block samples (block-library-roadmap.md). Kept in its own file for the
// max-lines lint cap; the gallery renders core + tier1 + tier2 + tier3 in order.
export const tier2Samples: BlockSample[] = [
  {
    label: "tabbed_content",
    block: {
      layout: "tabbed_content",
      data: {
        heading: "Everything in one place",
        intro: "Group related content behind tabs to keep the page scannable.",
        tabs: [
          { label: "Overview", content: "<h3>What it is</h3><p>A tabbed content block built on the accessible Tabs primitive — arrow-key navigable, with sanitised WYSIWYG content.</p>" },
          { label: "How it works", content: "<h3>The mechanism</h3><ul><li>Server sanitises each tab's HTML</li><li>The client leaf renders the Tabs</li><li>One tab visible at a time</li></ul>" },
          { label: "FAQ", content: "<h3>Common questions</h3><p>Use it for service details, specs, or anything that benefits from chunking.</p>" },
        ],
      },
    },
  },
  {
    label: "process_steps",
    block: {
      layout: "process_steps",
      data: {
        heading: "How it works",
        intro: "Three steps from brief to live site.",
        steps: [
          { title: "Brief", body: "We capture goals, brand and the service mix in a kickoff call." },
          { title: "Build", body: "AI agents build against headless WordPress; humans review every PR." },
          { title: "Launch", body: "Merge deploys to Vercel — measured, fast, and yours to edit." },
        ],
      },
    },
  },
  {
    label: "bento_grid",
    block: {
      layout: "bento_grid",
      data: {
        heading: "What we do",
        intro: "An asymmetric mosaic — tiles span the grid for visual rhythm.",
        items: [
          { title: "Headless builds", body: "Next.js + WordPress, sub-second loads.", span: "large", image: { sourceUrl: "https://picsum.photos/seed/bento1/900/600", altText: "" }, link_url: "#" },
          { title: "SEO", body: "Technical + content.", span: "normal" },
          { title: "Paid media", body: "Tracked end to end.", span: "normal" },
          { title: "Measurement", body: "GA4, server-side tagging, dashboards.", span: "wide", image: { sourceUrl: "https://picsum.photos/seed/bento2/900/400", altText: "" }, link_url: "#" },
          { title: "CRO", body: "Test, learn, lift.", span: "normal" },
          { title: "Email", body: "Lifecycle that converts.", span: "normal" },
        ],
      },
    },
  },
  {
    label: "case_studies",
    block: {
      layout: "case_studies",
      data: {
        heading: "Results we've delivered",
        intro: "Quantified outcomes — the proof that matters to buyers.",
        columns: 3,
        items: [
          { metric: "+212%", summary: "Organic traffic in two quarters via technical SEO + content.", client: "Northwind", link_label: "Read case study", link_url: "#" },
          { metric: "4.4x", summary: "Return on ad spend after restructuring paid search.", client: "Acme Studio", link_label: "Read case study", link_url: "#" },
          { metric: "−38%", summary: "Cost per lead with a rebuilt, faster landing experience.", client: "Globex", link_label: "Read case study", link_url: "#" },
        ],
      },
    },
  },
  {
    label: "timeline",
    block: {
      layout: "timeline",
      data: {
        heading: "Our story",
        events: [
          { date: "2014", title: "Founded", body: "Pod Digital opens its doors in Leicester." },
          { date: "2019", title: "100th client", body: "A milestone across SEO, PPC and web." },
          { date: "2026", title: "AI-assisted builds", body: "Agents build sites; humans review and ship." },
        ],
      },
    },
  },
  {
    label: "newsletter",
    block: {
      layout: "newsletter",
      data: {
        heading: "Get the monthly digest",
        intro: "Practical marketing and web notes — no fluff, unsubscribe anytime.",
        placeholder: "you@company.com",
        button_label: "Subscribe",
        success_message: "You're in — check your inbox to confirm.",
      },
    },
  },
  {
    label: "gallery",
    block: {
      layout: "gallery",
      data: {
        heading: "Selected work",
        intro: "Click any image to enlarge.",
        columns: 4,
        images: [
          { image: { sourceUrl: "https://picsum.photos/seed/gal1/600/600", altText: "Project one" }, caption: "Project one" },
          { image: { sourceUrl: "https://picsum.photos/seed/gal2/600/600", altText: "Project two" }, caption: "Project two" },
          { image: { sourceUrl: "https://picsum.photos/seed/gal3/600/600", altText: "Project three" }, caption: "Project three" },
          { image: { sourceUrl: "https://picsum.photos/seed/gal4/600/600", altText: "Project four" }, caption: "Project four" },
        ],
      },
    },
  },
];
