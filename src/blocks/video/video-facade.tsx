"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { CmsImage } from "@/lib/media";

// Lite YouTube facade: render a poster + play button; only mount the iframe on
// click, so the page doesn't pay for YouTube's payload up front (KB performance).
export function VideoFacade({
  videoId,
  image,
  label,
}: {
  videoId: string;
  image: CmsImage;
  label: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-card bg-black">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={label}
          allow="accelerated-sensors; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={label}
      className="group relative block aspect-video w-full overflow-hidden rounded-card bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {image?.sourceUrl ? (
        <Image
          src={image.sourceUrl}
          alt={image.altText ?? ""}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-modal transition motion-safe:group-hover:scale-105">
          <Play className="h-7 w-7 translate-x-0.5 fill-current" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}
