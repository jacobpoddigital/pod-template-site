// Shared formatters (lib layer — importable everywhere). Locale comes from
// site.config so dates read correctly per market (en-GB default).
import { siteConfig } from "../../site.config";

const LOCALE = siteConfig.locale.replace("_", "-");

/** A WP date string → a long human date, e.g. "9 June 2026". Empty on bad input. */
export function formatDate(date?: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric" });
}

/** "5 min read" from a reading-time integer; empty when unknown. */
export function readingTimeLabel(minutes?: number | null): string {
  return minutes && minutes > 0 ? `${minutes} min read` : "";
}
