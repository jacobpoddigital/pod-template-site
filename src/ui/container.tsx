import { cn } from "@/lib/utils";

// FRAMEWORK primitive — no CMS knowledge, no client-specific values.
// Padding: KB 09 non-negotiable — px-4 md:px-8 lg:px-16 (always, every width).
// Width is editor-controllable via the section_settings contract — a BOUNDED set
// (not arbitrary max-widths, per KB): default = the agency width, narrow = a
// measure-width column for prose, full = edge-to-edge content.

const WIDTHS = {
  default: "max-w-7xl",
  narrow: "max-w-3xl",
  full: "max-w-none",
} as const;

export type ContainerWidth = keyof typeof WIDTHS;

export function Container({
  width = "default",
  children,
}: {
  width?: ContainerWidth;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full px-4 md:px-8 lg:px-16", WIDTHS[width])}>{children}</div>;
}
