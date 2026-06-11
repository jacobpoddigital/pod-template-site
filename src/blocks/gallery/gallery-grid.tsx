"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/ui/dialog";
import { columnsClass } from "@/lib/section-settings";

export type GalleryImage = { src: string; alt: string; caption?: string | null };

// Client leaf — thumbnail grid + a single controlled lightbox Dialog (focus trap,
// Esc, return focus handled by Radix). One dialog, selected by index.
export function GalleryGrid({
  images,
  columns,
}: {
  images: GalleryImage[];
  columns?: number | null;
}) {
  const [active, setActive] = React.useState<number | null>(null);
  const current = active === null ? null : images[active];

  return (
    <>
      <ul role="list" className={`grid gap-4 ${columnsClass(columns)}`}>
        {images.map((img, i) => (
          <li key={`${img.src}-${i}`}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-card bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={img.caption ? `View: ${img.caption}` : `View image ${i + 1}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="sr-only">{current?.caption || "Gallery image"}</DialogTitle>
          <DialogDescription className="sr-only">Enlarged gallery image</DialogDescription>
          {current ? (
            <figure>
              <div className="relative aspect-video w-full overflow-hidden rounded-card bg-surface-muted">
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="(min-width: 1024px) 56rem, 100vw"
                  className="object-contain"
                />
              </div>
              {current.caption ? (
                <figcaption className="mt-3 text-center body-sm text-ink-muted">
                  {current.caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
