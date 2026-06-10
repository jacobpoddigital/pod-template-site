import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
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
            <Card key={card.title}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{card.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
