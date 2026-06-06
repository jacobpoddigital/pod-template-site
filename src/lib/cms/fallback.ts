import type { Page } from "./types";

// Graceful fallback content (workflow/01 §Phase 4): the site builds and renders
// before WordPress is connected, and keeps rendering if WP is unreachable at
// build/ISR time. Field names MUST match the ACF layouts / block schemas.
// TEMPLATE: replace with the client's approved copy (content/copy-NN.md) and
// keep in sync with the WP seed (wp/provision-content.php).

const home: Page = {
  slug: "home",
  title: "Home",
  blocks: [
    {
      layout: "hero",
      data: {
        heading: "Headline: the client's value proposition in eight words",
        subheading:
          "Subhead placeholder — twenty words answering the audience's biggest objection with a number or a mechanism.",
        cta_label: "Primary action",
        cta_url: "/#contact",
      },
    },
    {
      layout: "card_grid",
      data: {
        heading: "What you get",
        cards: [
          { title: "Benefit one", body: "Each card answers one audience objection from the brief — if it maps to none, cut it." },
          { title: "Benefit two", body: "Numbers over adjectives. A claim without a number or mechanism is filler." },
          { title: "Benefit three", body: "Body text stays under 160 characters — the budget is also the fluff filter." },
        ],
      },
    },
    {
      layout: "process_steps",
      data: {
        heading: "How it works",
        steps: [
          { title: "Step one", body: "Short, concrete, starts with what the client does." },
          { title: "Step two", body: "What they see and when." },
          { title: "Step three", body: "The outcome, with the timeline number." },
        ],
      },
    },
  ],
};

const pages: Record<string, Page> = { home };

export function getFallbackPage(slug: string): Page | null {
  return pages[slug] ?? null;
}
