import { z } from "zod";

/** Section colour-scheme tones — re-map the local surface (see globals.css [data-tone]).
 *  A block sets a tone and the whole section + its components re-theme automatically. */
export const TONES = ["default", "muted", "inverted", "accent"] as const;
export type Tone = (typeof TONES)[number];

export const toneSchema = z.enum(TONES).nullish();

/** data-tone attribute value (undefined for the default page surface). */
export function toneAttr(tone: Tone | null | undefined): string | undefined {
  return tone && tone !== "default" ? tone : undefined;
}
