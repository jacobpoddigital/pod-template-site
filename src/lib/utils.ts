import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
