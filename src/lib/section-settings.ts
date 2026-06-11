import { z } from "zod";
import { toneSchema, type Tone } from "@/lib/tone";

// EDITOR-CONTROLLED section settings (workflow/29 — the headless translation of
// Great White's `section_settings`). A section block exposes these so an editor
// changes a section's surface / spacing / width IN WORDPRESS — no rebuild.
//
// Curated + token-backed, NOT freeform CSS: each is a bounded select that resolves
// to a design-system value (the tone surfaces, the Section padding scale, the
// Container widths) — never a raw hex or arbitrary px (ADR 0014/0015 + KB "no raw
// values"). This is the one deliberate improvement over classic Great White.
//
// `tone` (surface) already exists in @/lib/tone; this adds `spacing` + `container`
// and bundles all three so every section block includes them the same way.

/** Vertical space around the section → maps to a <Section> padding preset. */
export const SPACINGS = ["default", "compact", "spacious", "none"] as const;
export type Spacing = (typeof SPACINGS)[number];
export const spacingSchema = z.enum(SPACINGS).nullish();

/** Content max-width → maps to a <Container> width. (`default` is the agency width.) */
export const CONTAINERS = ["default", "narrow", "full"] as const;
export type ContainerWidth = (typeof CONTAINERS)[number];
export const containerSchema = z.enum(CONTAINERS).nullish();

/** Repeater block layout: a responsive grid, or a scroll-snap slider. */
export const LAYOUTS = ["grid", "slider"] as const;
export type BlockLayout = (typeof LAYOUTS)[number];
export const layoutSchema = z.enum(LAYOUTS).nullish();

/** Spread into a section block's zod object: z.object({ ...sectionSettingsFields, … }).
 *  `anchor` gives the section an editor-set id so in-page nav (#anchor) can target it. */
export const sectionSettingsFields = {
  tone: toneSchema,
  spacing: spacingSchema,
  container: containerSchema,
  anchor: z.string().nullish(),
} as const;

export interface SectionSettings {
  tone?: Tone | null;
  spacing?: Spacing | null;
  container?: ContainerWidth | null;
  anchor?: string | null;
}

/** Editor `anchor` text → a safe HTML id (lowercase, hyphenated). Empty → "". */
export function toAnchorId(anchor?: string | null): string {
  return (anchor ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// spacing (editor vocabulary) → <Section> padding preset (the spacing scale).
const SPACING_TO_PADDING = {
  default: "default",
  compact: "compact",
  spacious: "hero",
  none: "none",
} as const;

/** Settings from the CMS → the <Section> props that apply them. Spread onto <Section>:
 *  <Section dataBlock="…" {...sectionProps({ tone, spacing, container })}>. */
export function sectionProps(s: SectionSettings) {
  return {
    tone: s.tone ?? undefined,
    padding: SPACING_TO_PADDING[s.spacing ?? "default"],
    container: s.container ?? "default",
  } as const;
}

// Editor `columns` (1–4) → a STATIC responsive grid-cols class (Tailwind needs
// whole class names, so this is a lookup, not interpolation). Grids start at 1 col
// on mobile and expand outward (KB 09). Clamped/defaulted to 3.
const COLUMNS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function columnsClass(n?: number | null): string {
  return COLUMNS[(n as 1 | 2 | 3 | 4) ?? 3] ?? COLUMNS[3];
}
