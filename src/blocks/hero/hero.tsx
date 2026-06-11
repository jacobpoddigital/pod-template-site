import Image from "next/image";
import { ButtonLink } from "@/ui/button-link";
import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import type { HeroProps } from "./schema";
import type { CmsImage } from "@/lib/media";

type Copy = Omit<HeroProps, "image" | "layout" | "tone" | "spacing" | "container">;

const ONIMAGE = { ink: "text-white", muted: "text-white/85", accent: "text-white" };
const ONSURFACE = { ink: "text-ink", muted: "text-ink-muted", accent: "text-brand-accent" };

function HeroCtas({ cta_label, cta_url, secondary_label, secondary_url }: Copy) {
  const primary = cta_label && cta_url;
  const secondary = secondary_label && secondary_url;
  if (!primary && !secondary) return null;
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      {primary ? <ButtonLink href={cta_url!}>{cta_label}</ButtonLink> : null}
      {secondary ? (
        <ButtonLink href={secondary_url!} variant="ghost">
          {secondary_label}
        </ButtonLink>
      ) : null}
    </div>
  );
}

function HeroCopy({ copy, onImage = false }: { copy: Copy; onImage?: boolean }) {
  const c = onImage ? ONIMAGE : ONSURFACE;
  return (
    <>
      {copy.eyebrow ? <p className={`mb-4 label ${c.accent}`}>{copy.eyebrow}</p> : null}
      <h1 className={`display-xl ${c.ink}`}>{copy.heading}</h1>
      {copy.subheading ? <p className={`mt-6 max-w-[65ch] body-lg ${c.muted}`}>{copy.subheading}</p> : null}
      <HeroCtas {...copy} />
    </>
  );
}

function HeroOverlay({ image, copy }: { image: NonNullable<CmsImage>; copy: Copy }) {
  return (
    <div className="relative isolate flex min-h-[26rem] items-center overflow-hidden rounded-card p-8 md:p-12">
      <Image src={image.sourceUrl} alt={image.altText ?? ""} fill priority sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden="true" />
      <div className="max-w-3xl">
        <HeroCopy copy={copy} onImage />
      </div>
    </div>
  );
}

function HeroSplit({ image, copy }: { image: NonNullable<CmsImage>; copy: Copy }) {
  return (
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-16">
      <div>
        <HeroCopy copy={copy} />
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface-muted">
        <Image src={image.sourceUrl} alt={image.altText ?? ""} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
    </div>
  );
}

export function Hero({ image, layout, tone, spacing, container, ...copy }: HeroProps) {
  const img = image?.sourceUrl ? image : null;
  const mode = img ? (layout ?? "text") : "text";
  return (
    // Defaults to the big "hero" padding (spacing="spacious"); editor can override.
    <Section dataBlock="hero" {...sectionProps({ tone, spacing: spacing ?? "spacious", container })}>
      {mode === "overlay" && img ? (
        <HeroOverlay image={img} copy={copy} />
      ) : mode === "split" && img ? (
        <HeroSplit image={img} copy={copy} />
      ) : (
        <div className="max-w-3xl">
          <HeroCopy copy={copy} />
        </div>
      )}
    </Section>
  );
}
