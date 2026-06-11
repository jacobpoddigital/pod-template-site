import Image from "next/image";
import { Section } from "@/ui/section";
import { ButtonLink } from "@/ui/button-link";
import { VideoFacade } from "@/ui/video-facade";
import { sectionProps } from "@/lib/section-settings";
import type { MediaTextProps } from "./schema";

// Image OR content side-by-side. KB 09 two-column split: stacks to one column on
// mobile with the MEDIA above the text; `media_position` swaps the columns at md+.
const RATIO = {
  landscape: "aspect-[4/3]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-video",
} as const;

// Mobile: media first (order-1), text second. At md+ the side follows media_position.
const ORDER = {
  right: { text: "order-2 md:order-1", media: "order-1 md:order-2" },
  left: { text: "order-2", media: "order-1" },
} as const;

function Media({
  image,
  videoId,
  ratio,
  className,
}: {
  image: MediaTextProps["image"];
  videoId?: string | null;
  ratio: string;
  className: string;
}) {
  // Video variant: a click-to-load facade (the image, if any, is its poster).
  if (videoId) {
    return (
      <div className={className}>
        <VideoFacade videoId={videoId} image={image} label="Play video" />
      </div>
    );
  }
  if (!image?.sourceUrl) return null;
  return (
    <div className={className}>
      <div className={`relative overflow-hidden rounded-card bg-surface-muted ${ratio}`}>
        <Image
          src={image.sourceUrl}
          alt={image.altText ?? ""}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}

export function MediaText({
  eyebrow,
  heading,
  body,
  cta_label,
  cta_url,
  image,
  video_id,
  media_position,
  media_ratio,
  tone,
  spacing,
  container,
}: MediaTextProps) {
  const order = ORDER[media_position ?? "right"];
  const ratio = RATIO[media_ratio ?? "landscape"];

  return (
    <Section dataBlock="media_text" {...sectionProps({ tone, spacing, container })}>
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-16">
        {/* Text is DOM-first (read order); on mobile the media re-orders above it. */}
        <div className={order.text}>
          {eyebrow ? <p className="mb-4 label text-brand-accent">{eyebrow}</p> : null}
          <h2 className="display-md text-ink">{heading}</h2>
          {body ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{body}</p> : null}
          {cta_label && cta_url ? (
            <div className="mt-8">
              <ButtonLink href={cta_url}>{cta_label}</ButtonLink>
            </div>
          ) : null}
        </div>

        <Media image={image} videoId={video_id} ratio={ratio} className={order.media} />
      </div>
    </Section>
  );
}
