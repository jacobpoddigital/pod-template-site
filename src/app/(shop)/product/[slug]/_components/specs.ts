// Shared spec maths for the adviser PDP — turns the catalogue's text attributes into the
// visual context a non-runner needs (cushioning + drop bars). Pure, server-safe, no deps.

// Cushioning spectrum → fill %. Catalogue uses Minimal/Moderate/Balanced/Responsive/Maximum.
const CUSHION_PCT: Record<string, number> = {
  minimal: 20,
  moderate: 45,
  balanced: 55,
  responsive: 65,
  maximum: 90,
};

export function cushionPct(cushioning: string | null): number | null {
  if (!cushioning) return null;
  return CUSHION_PCT[cushioning.trim().toLowerCase()] ?? null;
}

export const DROP_MAX_MM = 16;

/** Parse "10mm" → 10. */
export function dropMm(drop: string | null): number | null {
  if (!drop) return null;
  const n = parseFloat(drop.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Plain-English context for a heel-to-toe drop value. */
export function dropContext(mm: number): string {
  if (mm <= 4) return "A low drop — encourages a mid/forefoot strike and a more natural gait. Best for runners with strong calves and ankles.";
  if (mm <= 8) return "A moderate-low drop — a versatile middle ground that suits most gaits and running styles.";
  return "A traditional drop — works well for heel-strikers and runners moving across from everyday trainers.";
}
