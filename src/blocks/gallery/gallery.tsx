import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import { GalleryGrid, type GalleryImage } from "./gallery-grid";
import type { GalleryProps } from "./schema";

export function Gallery({
  heading,
  intro,
  columns,
  images,
  tone,
  spacing,
  container,
}: GalleryProps) {
  const items: GalleryImage[] = (Array.isArray(images) ? images : [])
    .filter((g) => g.image?.sourceUrl)
    .map((g) => ({
      src: g.image!.sourceUrl,
      alt: g.image!.altText ?? g.caption ?? "",
      caption: g.caption,
    }));
  if (items.length === 0) return null;

  return (
    <Section dataBlock="gallery" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? (
            <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
          ) : null}
        </div>
      ) : null}
      <GalleryGrid images={items} columns={columns} />
    </Section>
  );
}
