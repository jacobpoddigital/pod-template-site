import { Section } from "@/ui/section";
import { RichText } from "@/ui/rich-text";
import { SectionActions } from "@/ui/section-actions";
import { Eyebrow } from "@/ui/eyebrow";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/ui/accordion";
import { sectionProps } from "@/lib/section-settings";
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

export function Faq({ heading, eyebrow, footnote, cta_label, cta_url, secondary_label, secondary_url, items, tone, spacing, container }: FaqProps) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;
  return (
    <Section dataBlock="faq" {...sectionProps({ tone, spacing, container })}>
      {eyebrow || heading ? (
        <div className="mb-8">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
        </div>
      ) : null}
      <Accordion type="single" collapsible className="mx-auto max-w-3xl">
        {list.map((i, idx) => (
          <AccordionItem key={`${i.question}-${idx}`} value={`faq-${idx}`}>
            <AccordionTrigger>{i.question}</AccordionTrigger>
            <AccordionContent>{i.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(list)) }} />
      <SectionActions cta_label={cta_label} cta_url={cta_url} secondary_label={secondary_label} secondary_url={secondary_url} />
      {footnote ? <RichText html={footnote} className="mt-8 body-sm text-ink-muted" /> : null}
    </Section>
  );
}
