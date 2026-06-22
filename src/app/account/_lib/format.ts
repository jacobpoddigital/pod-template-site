// Account display formatting helpers (pure). Order dates come from Woo as ISO/space strings.

/** "12 Jun 2026" from a Woo order date; empty string when unparseable/missing. */
export function formatOrderDate(date: string | null | undefined): string {
  if (!date) return "";
  const raw = date.includes("T") ? date : `${date.replace(" ", "T")}Z`;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
