import { ButtonLink } from "@/ui/button-link";
import { Section } from "@/ui/section";
import type { HeroProps } from "./schema";

export function Hero({ eyebrow, heading, subheading, cta_label, cta_url, secondary_label, secondary_url, tone }: HeroProps) {
  const hasPrimary = cta_label && cta_url;
  const hasSecondary = secondary_label && secondary_url;
  return (
    <Section dataBlock="hero" tone={tone} padding="hero">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-4 label text-brand-accent">{eyebrow}</p>
        ) : null}
        <h1 className="display-xl text-ink">
          {heading}
        </h1>
        {subheading ? (
          <p className="mt-6 max-w-[65ch] body-lg text-ink-muted">{subheading}</p>
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
    </Section>
  );
}
