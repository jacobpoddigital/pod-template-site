import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { BlockRenderer } from "@/blocks/block-renderer";
import type { CmsBlock } from "@/lib/cms";

// Internal preview of the shared starter block library on the live theme — what ships in the
// template before a client build. Noindexed + absent from the CMS-driven sitemap. Sample data
// is inline here (not CMS content), so it's unaffected by ADR 0013 (WPGraphQL-only).
export const metadata: Metadata = { title: "Blocks", robots: { index: false, follow: false } };
export const dynamic = "error";

const samples: { label: string; block: CmsBlock }[] = [
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
];

export default function BlocksPage() {
  return (
    <main>
      <Container>
        <div className="py-12">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Block library</h1>
          <p className="mt-2 max-w-[65ch] text-ink-muted">
            The shared starter blocks shipped in this template, rendered on the live theme. A client build composes pages from these (and adds bespoke ones via <span className="font-mono">/new-block</span>). Internal reference — noindex.
          </p>
        </div>
      </Container>
      {samples.map(({ label, block }) => (
        <div key={label}>
          <Container>
            <p className="border-t border-border pb-2 pt-10 font-mono text-xs text-ink-muted">block: {label}</p>
          </Container>
          <BlockRenderer blocks={[block]} />
        </div>
      ))}
    </main>
  );
}
