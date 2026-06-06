import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import type { FaqProps } from "./schema";

// Ships its own FAQPage JSON-LD — server-rendered with the content, so AI
// crawlers (no JS) see it (workflow/04 §4, §9 citation-earning block).
function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function Faq({ heading, items }: FaqProps) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;
  return (
    <section className="py-section">
      <Container>
        {heading ? (
          <div className="mb-12 text-center">
            <Heading level={2}>{heading}</Heading>
          </div>
        ) : null}
        <div className="mx-auto max-w-3xl">
          {list.map((item) => (
            <details
              key={item.question}
              className="group mb-4 rounded-card bg-surface-muted p-6 open:bg-brand-light"
            >
              <summary className="cursor-pointer text-lg font-semibold">
                {item.question}
              </summary>
              <p className="mt-3 text-ink-muted">{item.answer}</p>
            </details>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(list)) }}
        />
      </Container>
    </section>
  );
}
