import { ButtonLink } from "@/ui/button-link";
import { Container } from "@/ui/container";
import type { HeroProps } from "./schema";

export function Hero({ eyebrow, heading, subheading, cta_label, cta_url, secondary_label, secondary_url }: HeroProps) {
  const hasPrimary = cta_label && cta_url;
  const hasSecondary = secondary_label && secondary_url;
  return (
    <section data-block="hero" className="bg-surface py-20 md:py-28 lg:py-32">
      <Container>
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="text-[clamp(2.25rem,5vw+1rem,4.5rem)] font-bold leading-[1.05] tracking-tight text-ink">
            {heading}
          </h1>
          {subheading ? (
            <p className="mt-6 max-w-[65ch] text-lg leading-relaxed text-ink-muted">{subheading}</p>
          ) : null}
          {hasPrimary || hasSecondary ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {hasPrimary ? <ButtonLink href={cta_url!}>{cta_label}</ButtonLink> : null}
              {hasSecondary ? (
                <ButtonLink href={secondary_url!} variant="ghost">
                  {secondary_label}
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
