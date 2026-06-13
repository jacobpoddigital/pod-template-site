import { z } from "zod";
import { WIDGET_SLUGS } from "@/widgets/slugs";

// EDITOR-CONTROLLED widget slot (mirrors @/lib/section-settings) — a block spreads
// `widgetSlotFields` into its zod object to gain an optional embedded widget. The value
// is a registry slug; empty/absent = no widget. A non-empty UNKNOWN slug fails LOUD at
// build/ISR (standards §11 fail-loud) so an editor typo can't silently render nothing.
// On the ACF side the field is a plain `text` (wpgraphql-acf 2.x exposes `select` as a
// LIST), validated here against the registered slugs.
export const widgetSlugSchema = z
  .string()
  .refine((s) => !s || (WIDGET_SLUGS as readonly string[]).includes(s), {
    message: `Unknown widget — must be one of: ${WIDGET_SLUGS.join(", ") || "(none registered)"}`,
  })
  .nullish();

export const widgetSlotFields = { widget: widgetSlugSchema } as const;
