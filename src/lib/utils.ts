import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Our type scale (globals.css @layer components) is the font-size contract (ADR 0015). Teach
// tailwind-merge they're one font-size group so a later rung overrides an earlier one — e.g.
// cn("body-sm", "body") → "body" (otherwise both survive and CSS source order decides, so an
// override silently no-ops). Keeps the scale usable as overrides on primitives.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["display-xl", "display-lg", "display-md", "display-sm", "display-xs", "body-lg", "body", "body-sm", "label"],
    },
  },
});

// Merge Tailwind classes safely — later args win, conflicts resolved by tailwind-merge.
// Use for all conditional and composed class strings. Never concatenate directly.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Initials from a name, for an Avatar fallback (e.g. "Jane Doe" → "JD"). Server-safe. */
export function initials(name?: string | null): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
