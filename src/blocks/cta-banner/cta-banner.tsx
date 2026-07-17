import { ButtonLink } from "@/ui/button-link";
import { Section } from "@/ui/section";
import { Eyebrow } from "@/ui/eyebrow";
import { RichText } from "@/ui/rich-text";
import { sectionProps } from "@/lib/section-settings";
import type { CtaBannerProps } from "./schema";

export function CtaBanner({ heading, eyebrow, body, cta_label, cta_url, secondary_label, secondary_url, footnote, tone, spacing, container }: CtaBannerProps) {
  const secondary = secondary_label && secondary_url;
  return (
    <Section dataBlock="cta_banner" {...sectionProps({ tone: tone ?? "inverted", spacing, container })}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="display-md">{heading}</h2>
        {body ? <p className="max-w-[65ch] body-lg text-muted-foreground">{body}</p> : null}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href={cta_url}>{cta_label}</ButtonLink>
          {secondary ? <ButtonLink href={secondary_url!} variant="ghost">{secondary_label}</ButtonLink> : null}
        </div>
        {footnote ? <RichText html={footnote} className="body-sm text-muted-foreground [&_p]:mt-0" /> : null}
      </div>
    </Section>
  );
}
