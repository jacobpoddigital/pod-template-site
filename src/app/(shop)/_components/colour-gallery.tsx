"use client";

import * as React from "react";
import type { ProductImage } from "@/lib/commerce/products";

// Shares the selected colourway between the variation selector (which sets it) and the gallery
// (which swaps its primary image to match). A no-op default means components that consume it
// WITHOUT a provider — e.g. the quick-view selector, which has no colourway gallery — just work.
type ColourGallery = {
  selectedColour: string | null;
  setSelectedColour: (colour: string | null) => void;
  colourImages: Record<string, ProductImage>; // normalised colour value → image
};

const noop = () => {};
const ColourGalleryContext = React.createContext<ColourGallery>({
  selectedColour: null,
  setSelectedColour: noop,
  colourImages: {},
});

export function ColourGalleryProvider({
  colourImages,
  children,
}: {
  colourImages: Record<string, ProductImage>;
  children: React.ReactNode;
}) {
  const [selectedColour, setSelectedColour] = React.useState<string | null>(null);
  const value = React.useMemo(
    () => ({ selectedColour, setSelectedColour, colourImages }),
    [selectedColour, colourImages],
  );
  return <ColourGalleryContext.Provider value={value}>{children}</ColourGalleryContext.Provider>;
}

export const useColourGallery = () => React.useContext(ColourGalleryContext);
