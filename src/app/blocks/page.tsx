import type { Metadata } from "next";
import { Container } from "@/ui/container";
import { BlockRenderer } from "@/blocks/block-renderer";
import { samples } from "./samples";

// Internal preview of the shared starter block library on the live theme — what ships in the
// template before a client build. Noindexed + absent from the CMS-driven sitemap. Sample data
// lives in ./samples (not CMS content), so it's unaffected by ADR 0013 (WPGraphQL-only).
export const metadata: Metadata = { title: "Blocks", robots: { index: false, follow: false } };
export const dynamic = "error";

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
