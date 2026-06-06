import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import type { CardGridProps } from "./schema";

export function CardGrid({ heading, cards }: CardGridProps) {
  const items = Array.isArray(cards) ? cards : [];
  if (items.length === 0) return null;
  return (
    <section id="services" className="py-section">
      <Container>
        {heading ? (
          <div className="mb-12 text-center">
            <Heading level={2}>{heading}</Heading>
          </div>
        ) : null}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((card) => (
            <div
              key={card.title}
              className="rounded-card bg-surface-muted p-8"
            >
              <Heading level={3}>{card.title}</Heading>
              <p className="mt-3 text-ink-muted">{card.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
