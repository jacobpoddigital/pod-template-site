import { z } from "zod";

/** Section colour-scheme tones — re-map the local surface (see globals.css [data-tone]).
 *  A block sets data-tone on its <section> and everything inside re-themes automatically. */
export const toneSchema = z.enum(["default", "muted", "inverted", "accent"]).nullish();
export type Tone = NonNullable<z.infer<typeof toneSchema>>;

/** data-tone attribute value (undefined for the default page surface). */
export function toneAttr(tone: Tone | null | undefined): string | undefined {
  return tone && tone !== "default" ? tone : undefined;
}
