import { ButtonLink } from "@/ui/button-link";
import { Section } from "@/ui/section";
import { Eyebrow } from "@/ui/eyebrow";
import { sectionProps } from "@/lib/section-settings";
import type { CtaBannerProps } from "./schema";

export function CtaBanner({ heading, eyebrow, body, cta_label, cta_url, tone, spacing, container }: CtaBannerProps) {
  return (
    <Section dataBlock="cta_banner" {...sectionProps({ tone: tone ?? "inverted", spacing, container })}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="display-md">{heading}</h2>
        {body ? <p className="max-w-[65ch] body-lg text-muted-foreground">{body}</p> : null}
        <ButtonLink href={cta_url}>{cta_label}</ButtonLink>
      </div>
    </Section>
  );
}
