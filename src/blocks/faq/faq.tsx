import { Container } from "@/ui/container";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/ui/accordion";
import type { FaqProps } from "./schema";

// Ships FAQPage JSON-LD server-rendered with the content, so AI/search crawlers (no JS) read it.
function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

export function Faq({ heading, items }: FaqProps) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;
  return (
    <section data-block="faq" className="py-16 md:py-20 lg:py-24">
      <Container>
        {heading ? (
          <h2 className="mb-8 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{heading}</h2>
        ) : null}
        <Accordion type="single" collapsible className="mx-auto max-w-3xl">
          {list.map((i, idx) => (
            <AccordionItem key={i.question} value={`faq-${idx}`}>
              <AccordionTrigger>{i.question}</AccordionTrigger>
              <AccordionContent>{i.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(list)) }} />
      </Container>
    </section>
  );
}
