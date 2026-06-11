import * as React from "react";
import { cn } from "@/lib/utils";
import { Container, type ContainerWidth } from "@/ui/container";
import { toneAttr, type Tone } from "@/lib/tone";

// THE root for every block. Owns the section-level concerns so they can't drift across blocks:
//   • surface + text (bg-background text-foreground — tone-aware)
//   • the vertical padding scale (one source of truth)
//   • the colour-scheme tone (data-tone)
//   • the Container (max-width + horizontal padding scale)
// A block renders <Section dataBlock="…" tone={tone}>…</Section> — never a raw <section>.
// tone / padding / container are the editor-controlled section_settings (see
// @/lib/section-settings) — a block spreads them via sectionProps(...).

const PADDING = {
  default: "py-16 md:py-20 lg:py-24",
  hero: "py-20 md:py-28 lg:py-32",
  compact: "py-12 md:py-16",
  none: "",
} as const;

export interface SectionProps {
  /** the acf_fc_layout name → data-block (analytics / debugging) */
  dataBlock: string;
  tone?: Tone | null;
  padding?: keyof typeof PADDING;
  container?: ContainerWidth;
  className?: string;
  children: React.ReactNode;
}

export function Section({ dataBlock, tone, padding = "default", container = "default", className, children }: SectionProps) {
  return (
    <section
      data-block={dataBlock}
      data-tone={toneAttr(tone)}
      className={cn("bg-background text-foreground", PADDING[padding], className)}
    >
      <Container width={container}>{children}</Container>
    </section>
  );
}
