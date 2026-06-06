import { ButtonLink } from "@/ui/button-link";
import { Container } from "@/ui/container";
import type { HeroProps } from "./schema";

export function Hero({ heading, subheading, cta_label, cta_url }: HeroProps) {
  return (
    <section className="bg-brand-light py-section">
      <Container>
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {heading}
          </h1>
          {subheading ? (
            <p className="mt-6 text-lg text-ink-muted">{subheading}</p>
          ) : null}
          {cta_label && cta_url ? (
            <div className="mt-8">
              <ButtonLink href={cta_url}>{cta_label}</ButtonLink>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
