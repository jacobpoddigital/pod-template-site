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
  pairs,
  tone,
  spacing,
  container,
}: BeforeAfterProps) {
  // MULTI-PAIR gallery — a responsive grid of comparisons (e.g. two side by side).
  const gallery = (Array.isArray(pairs) ? pairs : []).filter(
    (p) => p.before_image?.sourceUrl && p.after_image?.sourceUrl,
  );
  if (gallery.length > 0) {
    return (
      <Section dataBlock="before_after" {...sectionProps({ tone, spacing, container })}>
        <Intro heading={heading} intro={intro} />
        <div className="grid gap-8 sm:grid-cols-2">
          {gallery.map((p, i) => (
            <figure key={i} className="m-0">
              <BeforeAfterSlider
                before={layer(p.before_image, p.before_label, "Before")}
                after={layer(p.after_image, p.after_label, "After")}
                beforeLabel={p.before_label}
                afterLabel={p.after_label}
              />
              {p.caption ? <figcaption className="mt-3 body-sm text-ink-muted">{p.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </Section>
    );
  }

  // SINGLE comparison (top-level fields).
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
