import type { CmsBlock } from "@/lib/cms";
import { extraSamples } from "./samples-extra";
import { tier2Samples } from "./samples-tier2";
import { tier3Samples } from "./samples-tier3";

export type BlockSample = { label: string; block: CmsBlock };

const coreSamples: BlockSample[] = [
  {
    label: "hero",
    block: {
      layout: "hero",
      data: {
        eyebrow: "Pod Digital",
        heading: "A headline that states the outcome",
        subheading: "One supporting line that earns the scroll — concrete, with a number or a mechanism, never adjectives.",
        cta_label: "Book a demo",
        cta_url: "#",
        secondary_label: "See pricing",
        secondary_url: "#",
      },
    },
  },
  {
    label: "logo_strip",
    block: { layout: "logo_strip", data: { heading: "Trusted by teams at", logos: [{ name: "Northwind" }, { name: "Acme" }, { name: "Globex" }, { name: "Initech" }, { name: "Umbrella" }] } },
  },
  {
    label: "feature_grid",
    block: {
      layout: "feature_grid",
      data: {
        heading: "What you get",
        intro: "Each card answers one audience objection — if it maps to none, cut it.",
        features: [
          { title: "Fast", body: "Static-first, sub-second loads on mobile.", icon: "zap" },
          { title: "Clear", body: "Every claim carries a number or a mechanism.", icon: "check" },
          { title: "Owned", body: "You hold the code and the CMS — no lock-in.", icon: "lock" },
        ],
      },
    },
  },
  {
    label: "faq",
    block: { layout: "faq", data: { heading: "Questions", items: [{ question: "How long does a build take?", answer: "Days, not weeks — most marketing sites ship in under two." }, { question: "Who owns the site?", answer: "You do — the code and the WordPress content, fully." }, { question: "Can we edit it ourselves?", answer: "Yes — content is edited in WordPress; no developer needed." }] } },
  },
  {
    label: "cta_banner",
    block: { layout: "cta_banner", data: { heading: "Ready to see it?", body: "Book a 20-minute walkthrough — no slides, just the build.", cta_label: "Book a demo", cta_url: "#" } },
  },
  {
    label: "contact_form",
    block: { layout: "contact_form", data: { heading: "Get in touch", intro: "Tell us about the project and we'll come back within one working day." } },
  },
  {
    label: "media_text",
    block: {
      layout: "media_text",
      data: {
        eyebrow: "How it works",
        heading: "Image or video, beside the copy that earns the click",
        body: "media_text composes the shared <Section>, so an editor sets the spacing, width and surface in WordPress — no rebuild. The image leads on mobile; media_position swaps the columns on desktop.",
        cta_label: "See the contract",
        cta_url: "#",
        image: { sourceUrl: "https://picsum.photos/seed/podmedia/1200/900", altText: "Placeholder", mediaDetails: { width: 1200, height: 900 } },
        media_position: "right",
        media_ratio: "landscape",
      },
    },
  },
  {
    label: "card_grid",
    block: {
      layout: "card_grid",
      data: {
        heading: "What we do",
        intro: "An image card grid — the columns count is an editor setting.",
        columns: 3,
        cards: [
          { title: "Strategy", body: "Plan the work before the work.", link_label: "Learn more", link_url: "#", image: { sourceUrl: "https://picsum.photos/seed/card1/800/450", altText: "" } },
          { title: "Design", body: "Taste, applied to a system.", link_label: "Learn more", link_url: "#", image: { sourceUrl: "https://picsum.photos/seed/card2/800/450", altText: "" } },
          { title: "Build", body: "Headless, fast, measurable.", link_label: "Learn more", link_url: "#", image: { sourceUrl: "https://picsum.photos/seed/card3/800/450", altText: "" } },
        ],
      },
    },
  },
  {
    label: "services_grid (tone=muted)",
    block: {
      layout: "services_grid",
      data: {
        heading: "Services",
        intro: "Icon/image-led cards with a brand-accent treatment.",
        tone: "muted",
        columns: 3,
        services: [
          { title: "SEO", body: "Technical + content, traditional and AI search.", link_label: "Explore", link_url: "#", image: { sourceUrl: "https://picsum.photos/seed/svc1/200/200", altText: "" } },
          { title: "PPC", body: "Conversion-tracked paid search and social.", link_label: "Explore", link_url: "#", image: { sourceUrl: "https://picsum.photos/seed/svc2/200/200", altText: "" } },
          { title: "Web", body: "AI-assisted headless builds.", link_label: "Explore", link_url: "#", image: { sourceUrl: "https://picsum.photos/seed/svc3/200/200", altText: "" } },
        ],
      },
    },
  },
  {
    label: "usp_bar (tone=accent)",
    block: {
      layout: "usp_bar",
      data: {
        tone: "accent",
        items: [
          { text: "10+ years", image: { sourceUrl: "https://picsum.photos/seed/usp1/80/80", altText: "" } },
          { text: "ROI-driven", image: { sourceUrl: "https://picsum.photos/seed/usp2/80/80", altText: "" } },
          { text: "Headless + fast", image: { sourceUrl: "https://picsum.photos/seed/usp3/80/80", altText: "" } },
        ],
      },
    },
  },
  {
    label: "reviews",
    block: {
      layout: "reviews",
      data: {
        heading: "What clients say",
        columns: 3,
        reviews: [
          { quote: "They rebuilt our funnel and doubled enquiries.", author: "A. Client", role: "Founder, Acme", rating: 5 },
          { quote: "Fast, measurable, and genuinely hands-off for us.", author: "B. Client", role: "MD, Globex", rating: 5 },
          { quote: "The reporting alone paid for itself.", author: "C. Client", role: "CMO, Initech", rating: 4 },
        ],
      },
    },
  },
  {
    label: "rich_text",
    block: {
      layout: "rich_text",
      data: {
        content: "<h2>A prose band</h2><p>The <strong>rich_text</strong> block renders WordPress WYSIWYG content with prose typography, capped at a 65ch measure. Editors can widen it via the container setting.</p><ul><li>Headings, lists and links are styled</li><li>Narrow container by default</li></ul>",
      },
    },
  },
  {
    label: "columns",
    block: {
      layout: "columns",
      data: {
        heading: "Columns",
        column_count: 3,
        column_items: [
          { content: "<h3>Discover</h3><p>We start with the data and the goal.</p>" },
          { content: "<h3>Design</h3><p>Then the system and the taste.</p>" },
          { content: "<h3>Deliver</h3><p>Then the build, measured.</p>" },
        ],
      },
    },
  },
  {
    label: "video",
    block: {
      layout: "video",
      data: {
        heading: "Watch the 90-second overview",
        video_id: "dQw4w9WgXcQ",
        button_text: "Play the overview",
        facade_image: { sourceUrl: "https://picsum.photos/seed/video/1280/720", altText: "Video thumbnail" },
      },
    },
  },
  {
    label: "key_takeaways",
    block: {
      layout: "key_takeaways",
      data: {
        heading: "Key takeaways",
        points: [
          { text: "Headless WordPress + Next.js gives sub-second loads and first-party measurement." },
          { text: "Editors control layout via section settings — no developer rebuild." },
          { text: "Stats, tables and quotes lift visibility in AI search." },
        ],
      },
    },
  },
  {
    label: "stat_with_source",
    block: {
      layout: "stat_with_source",
      data: {
        heading: "The numbers",
        columns: 3,
        stats: [
          { value: "+41%", label: "AI visibility from quotations", source: "GEO, Princeton KDD 2024" },
          { value: "4.4x", label: "AI referrals convert vs organic", source: "Adobe" },
          { value: "<2.5s", label: "LCP target on every build", source: "Core Web Vitals" },
        ],
      },
    },
  },
  {
    label: "comparison_table",
    block: {
      layout: "comparison_table",
      data: {
        heading: "Headless vs traditional",
        option_a_label: "Great White Pro (headless)",
        option_b_label: "Classic WordPress",
        rows: [
          { feature: "Page speed", option_a: "Sub-second (static/edge)", option_b: "Variable (PHP render)" },
          { feature: "First-party measurement", option_a: "Native (server-side)", option_b: "Bolt-on" },
          { feature: "Editor layout control", option_a: "Section settings, no rebuild", option_b: "Developer or page builder" },
        ],
      },
    },
  },
  {
    label: "author_byline",
    block: {
      layout: "author_byline",
      data: {
        name: "Jacob Hedges",
        role: "Pod Digital",
        date: "11 June 2026",
        bio: "Building the AI-assisted web tier at Pod Digital.",
        profile_url: "#",
        avatar: { sourceUrl: "https://picsum.photos/seed/author/200/200", altText: "Author avatar" },
      },
    },
  },
  {
    label: "hero (split)",
    block: {
      layout: "hero",
      data: {
        eyebrow: "Pod Digital",
        heading: "A headline beside a supporting image",
        subheading: "The split layout puts copy and image side by side; on mobile the image leads.",
        cta_label: "Book a demo",
        cta_url: "#",
        layout: "split",
        image: { sourceUrl: "https://picsum.photos/seed/herosplit/1000/800", altText: "" },
      },
    },
  },
  {
    label: "hero (overlay)",
    block: {
      layout: "hero",
      data: {
        eyebrow: "Pod Digital",
        heading: "Copy over a full-bleed image",
        subheading: "The overlay layout sets text on the image with a scrim for contrast.",
        cta_label: "Get started",
        cta_url: "#",
        layout: "overlay",
        image: { sourceUrl: "https://picsum.photos/seed/herooverlay/1600/900", altText: "" },
      },
    },
  },
  {
    label: "media_text (video)",
    block: {
      layout: "media_text",
      data: {
        eyebrow: "Watch",
        heading: "media_text with a video instead of an image",
        body: "Set a video_id and the media slot becomes a click-to-load YouTube facade.",
        video_id: "dQw4w9WgXcQ",
        image: { sourceUrl: "https://picsum.photos/seed/mtvideo/1200/675", altText: "Video poster" },
        media_position: "right",
      },
    },
  },
  {
    label: "card_grid (slider)",
    block: {
      layout: "card_grid",
      data: {
        heading: "Card grid as a slider",
        layout: "slider",
        cards: [
          { title: "One", body: "Scroll-snap slider, no JS dependency.", image: { sourceUrl: "https://picsum.photos/seed/s1/800/450", altText: "" } },
          { title: "Two", body: "Peeks the next card on mobile.", image: { sourceUrl: "https://picsum.photos/seed/s2/800/450", altText: "" } },
          { title: "Three", body: "Keyboard-scrollable region.", image: { sourceUrl: "https://picsum.photos/seed/s3/800/450", altText: "" } },
          { title: "Four", body: "Same card, slider layout.", image: { sourceUrl: "https://picsum.photos/seed/s4/800/450", altText: "" } },
        ],
      },
    },
  },
  {
    label: "post_grid",
    block: { layout: "post_grid", data: { heading: "From the blog", intro: "Fetched live (mock posts in dev).", count: 3 } },
  },
];

// Roadmap additions live in separate files to keep each under the max-lines lint
// cap; the gallery renders core + tier1 + tier2 + tier3 in order.
export const samples: BlockSample[] = [
  ...coreSamples,
  ...extraSamples,
  ...tier2Samples,
  ...tier3Samples,
];
