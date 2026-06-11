import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import { BeforeAfterSlider } from "./before-after-slider";
import type { BeforeAfterProps } from "./schema";
import type { CmsImage } from "@/lib/media";

function Intro({ heading, intro }: { heading?: string | null; intro?: string | null }) {
  if (!heading && !intro) return null;
  return (
    <div className="mb-10 max-w-2xl">
      {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
      {intro ? (
        <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
      ) : null}
    </div>
  );
}

function layer(img: CmsImage, label: string | null | undefined, fallback: string) {
  const alt = img?.altText || label || fallback;
  return { src: img?.sourceUrl ?? "", alt };
}

export function BeforeAfter({
  heading,
  intro,
  before_image,
  after_image,
  before_label,
  after_label,
  tone,
  spacing,
  container,
}: BeforeAfterProps) {
  const before = layer(before_image, before_label, "Before");
  const after = layer(after_image, after_label, "After");
  if (!before.src || !after.src) return null;

  return (
    <Section dataBlock="before_after" {...sectionProps({ tone, spacing, container: container ?? "narrow" })}>
      <Intro heading={heading} intro={intro} />
      <BeforeAfterSlider
        before={before}
        after={after}
        beforeLabel={before_label}
        afterLabel={after_label}
      />
    </Section>
  );
}
