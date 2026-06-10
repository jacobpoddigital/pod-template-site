import { ButtonLink } from "@/ui/button-link";
import { Section } from "@/ui/section";
import type { CtaBannerProps } from "./schema";

export function CtaBanner({ heading, body, cta_label, cta_url, tone }: CtaBannerProps) {
  return (
    <Section dataBlock="cta_banner" tone={tone ?? "inverted"}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
        {body ? <p className="max-w-[65ch] text-lg leading-relaxed text-muted-foreground">{body}</p> : null}
        <ButtonLink href={cta_url}>{cta_label}</ButtonLink>
      </div>
    </Section>
  );
}
