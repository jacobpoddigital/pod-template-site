import { ButtonLink } from "@/ui/button-link";
import { Container } from "@/ui/container";
import type { CtaBannerProps } from "./schema";

export function CtaBanner({ heading, cta_label, cta_url }: CtaBannerProps) {
  return (
    <section className="bg-brand py-section">
      <Container>
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-on-brand">
            {heading}
          </h2>
          <ButtonLink href={cta_url} variant="secondary">
            {cta_label}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
