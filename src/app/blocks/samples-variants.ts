import type { BlockSample } from "./samples";

// Variant showcase — the same blocks under their different editor settings (tone,
// layout grid/slider, column count, media position, pricing toggle on/off). Section
// tone (default/muted/inverted/accent) applies to EVERY block; shown here on a few.
export const variantSamples: BlockSample[] = [
  // --- Section tones (apply to all blocks) ---
  {
    label: "tone=muted — cta_banner",
    block: { layout: "cta_banner", data: { tone: "muted", heading: "Muted surface", body: "A subtle alternate surface to separate sections.", cta_label: "Action", cta_url: "#" } },
  },
  {
    label: "tone=inverted — cta_banner",
    block: { layout: "cta_banner", data: { tone: "inverted", heading: "Inverted surface", body: "High-contrast dark band — good for a closing CTA.", cta_label: "Action", cta_url: "#" } },
  },
  {
    label: "tone=accent — cta_banner",
    block: { layout: "cta_banner", data: { tone: "accent", heading: "Accent surface", body: "Brand-accent band for a standout moment.", cta_label: "Action", cta_url: "#" } },
  },

  // --- Grid column counts (card_grid) ---
  {
    label: "card_grid (columns=2)",
    block: {
      layout: "card_grid",
      data: {
        heading: "Two columns", columns: 2,
        cards: [
          { title: "One", body: "Wider cards, two per row on desktop.", image: { sourceUrl: "https://picsum.photos/seed/c2a/800/450", altText: "" } },
          { title: "Two", body: "Set by the editor's columns field.", image: { sourceUrl: "https://picsum.photos/seed/c2b/800/450", altText: "" } },
        ],
      },
    },
  },
  {
    label: "card_grid (columns=4)",
    block: {
      layout: "card_grid",
      data: {
        heading: "Four columns", columns: 4,
        cards: [
          { title: "One", body: "Compact.", image: { sourceUrl: "https://picsum.photos/seed/c4a/600/400", altText: "" } },
          { title: "Two", body: "Four-up.", image: { sourceUrl: "https://picsum.photos/seed/c4b/600/400", altText: "" } },
          { title: "Three", body: "On desktop.", image: { sourceUrl: "https://picsum.photos/seed/c4c/600/400", altText: "" } },
          { title: "Four", body: "Collapses on mobile.", image: { sourceUrl: "https://picsum.photos/seed/c4d/600/400", altText: "" } },
        ],
      },
    },
  },

  // --- Layout: slider variants ---
  {
    label: "services_grid (layout=slider)",
    block: {
      layout: "services_grid",
      data: {
        heading: "Services as a slider", layout: "slider",
        services: [
          { title: "SEO", body: "Technical + content.", image: { sourceUrl: "https://picsum.photos/seed/ss1/200/200", altText: "" } },
          { title: "PPC", body: "Tracked paid search.", image: { sourceUrl: "https://picsum.photos/seed/ss2/200/200", altText: "" } },
          { title: "Web", body: "Headless builds.", image: { sourceUrl: "https://picsum.photos/seed/ss3/200/200", altText: "" } },
          { title: "Email", body: "Lifecycle.", image: { sourceUrl: "https://picsum.photos/seed/ss4/200/200", altText: "" } },
        ],
      },
    },
  },
  {
    label: "reviews (layout=slider)",
    block: {
      layout: "reviews",
      data: {
        heading: "Reviews as a slider", layout: "slider",
        reviews: [
          { quote: "Doubled our enquiries.", author: "A. Client", role: "Acme", rating: 5, avatar: { sourceUrl: "https://i.pravatar.cc/96?img=5", altText: "" } },
          { quote: "Hands-off and effective.", author: "B. Client", role: "Globex", rating: 5, avatar: { sourceUrl: "https://i.pravatar.cc/96?img=8", altText: "" } },
          { quote: "Reporting paid for itself.", author: "C. Client", role: "Initech", rating: 4 },
        ],
      },
    },
  },

  // --- media_text: image on the left ---
  {
    label: "media_text (position=left)",
    block: {
      layout: "media_text",
      data: {
        eyebrow: "Variant", heading: "Image on the left", body: "media_position flips the columns on desktop; the image still leads on mobile.",
        media_position: "left",
        image: { sourceUrl: "https://picsum.photos/seed/mtleft/1200/900", altText: "" },
      },
    },
  },

  // --- pricing: no annual toggle, no featured plan ---
  {
    label: "pricing (single price, no toggle)",
    block: {
      layout: "pricing",
      data: {
        heading: "Two simple plans",
        plans: [
          { name: "Care", price: "£99", period: "/mo", description: "Hosting, updates, backups.", cta_label: "Choose Care", cta_url: "#", features: [{ text: "Managed hosting" }, { text: "Monthly updates" }] },
          { name: "Care+", price: "£249", period: "/mo", description: "Everything plus content edits.", cta_label: "Choose Care+", cta_url: "#", features: [{ text: "Everything in Care" }, { text: "Content edits" }, { text: "Priority support" }] },
        ],
      },
    },
  },

  // --- stats_band: 2-up ---
  {
    label: "stats_band (columns=2, tone=inverted)",
    block: {
      layout: "stats_band",
      data: {
        tone: "inverted", columns: 2,
        stats: [
          { value: "£5M+", label: "Ad spend managed" },
          { value: "4.9/5", label: "Average client rating" },
        ],
      },
    },
  },

  // --- bento_grid: tone=muted ---
  {
    label: "bento_grid (tone=muted)",
    block: {
      layout: "bento_grid",
      data: {
        tone: "muted", heading: "Bento on a muted surface",
        items: [
          { title: "Large tile", body: "2×2 span with an image.", span: "large", image: { sourceUrl: "https://picsum.photos/seed/bm1/900/600", altText: "" } },
          { title: "Normal", body: "1×1.", span: "normal" },
          { title: "Normal", body: "1×1.", span: "normal" },
          { title: "Wide", body: "2×1.", span: "wide" },
        ],
      },
    },
  },
];
