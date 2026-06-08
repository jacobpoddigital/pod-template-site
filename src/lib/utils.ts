import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes safely — later args win, conflicts resolved by tailwind-merge.
// Use for all conditional and composed class strings. Never concatenate directly.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
