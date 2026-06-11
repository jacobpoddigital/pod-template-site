"use client";

import * as React from "react";
import Image from "next/image";

type Img = { src: string; alt: string };

// Keyboard-accessible image comparison: a range input drives a CSS clip on the
// "after" layer (range inputs are natively operable + announced). No pointer-only
// logic, no layout animation — just clip width.
export function BeforeAfterSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
}: {
  before: Img;
  after: Img;
  beforeLabel?: string | null;
  afterLabel?: string | null;
}) {
  const [pos, setPos] = React.useState(50);

  return (
    <div className="relative">
      <div className="relative aspect-video w-full overflow-hidden rounded-card bg-surface-muted">
        <Image src={before.src} alt={before.alt} fill sizes="100vw" className="object-cover" />
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image src={after.src} alt={after.alt} fill sizes="100vw" className="object-cover" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-y-0 w-0.5 bg-white shadow"
          style={{ left: `${pos}%` }}
        />
        {beforeLabel ? (
          <span className="absolute left-3 top-3 rounded-card bg-black/60 px-2 py-1 label text-white">
            {beforeLabel}
          </span>
        ) : null}
        {afterLabel ? (
          <span className="absolute right-3 top-3 rounded-card bg-black/60 px-2 py-1 label text-white">
            {afterLabel}
          </span>
        ) : null}
      </div>
      <label className="mt-4 block">
        <span className="sr-only">Reveal the after image</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="h-11 w-full cursor-ew-resize accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Reveal the after image"
        />
      </label>
    </div>
  );
}
