import Image from "next/image";

// The blog/archive banner (Great White's .pod-header, ported). Optional background
// image (a category's ACF banner, or a site-wide blog banner) with a token-driven
// scrim so the title always meets contrast; otherwise a clean muted band. The eyebrow
// + description carry the archive context (category/tag name + its description).
export function ArchiveHero({
  title,
  eyebrow,
  description,
  image,
}: {
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
}) {
  const hasImage = Boolean(image?.sourceUrl);
  return (
    <section
      data-block="archive_hero"
      className="relative isolate bg-surface-muted text-ink"
    >
      {hasImage ? (
        <>
          <Image
            src={image!.sourceUrl}
            alt={image!.altText ?? ""}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          {/* Scrim — keeps the heading legible on any image (a11y contrast). */}
          <div aria-hidden className="absolute inset-0 bg-foreground/55" />
        </>
      ) : null}

      <div
        className={
          "relative mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-16 " +
          (hasImage ? "py-20 text-background md:py-28" : "py-14 md:py-20")
        }
      >
        {eyebrow ? <p className="label mb-3 opacity-80">{eyebrow}</p> : null}
        <h1 className="display-lg max-w-[20ch]">{title}</h1>
        {description ? (
          <p className={"mt-4 body-lg max-w-[60ch] " + (hasImage ? "text-background/90" : "text-ink-muted")}>
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
