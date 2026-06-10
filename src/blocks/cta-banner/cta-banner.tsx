import { ButtonLink } from "@/ui/button-link";
import { Container } from "@/ui/container";
import { toneAttr } from "../tone";
import type { CtaBannerProps } from "./schema";

export function CtaBanner({ heading, body, cta_label, cta_url, tone }: CtaBannerProps) {
  return (
    <section
      data-block="cta_banner"
      data-tone={toneAttr(tone ?? "inverted")}
      className="bg-background py-16 text-foreground md:py-20 lg:py-24"
    >
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
          {body ? <p className="max-w-[65ch] text-lg leading-relaxed text-muted-foreground">{body}</p> : null}
          <ButtonLink href={cta_url}>{cta_label}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
