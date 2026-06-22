// Pure order-status helpers — NO `server-only` so client components (the order-status badge used in
// the client OrdersList) and server components both import them. Mirrors pricing.ts's pure-helper
// split from the server-only data layer. Generic → template M5.

export type OrderStatus =
  | "PENDING" | "PROCESSING" | "ON_HOLD" | "COMPLETED" | "CANCELLED" | "REFUNDED" | "FAILED" | "CHECKOUT_DRAFT";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending payment",
  PROCESSING: "Processing",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  FAILED: "Failed",
  CHECKOUT_DRAFT: "Draft",
};
/** Tone hint for a status badge (success = done, warning = needs attention, muted = inactive). */
const STATUS_TONE: Record<string, "success" | "warning" | "muted" | "default"> = {
  COMPLETED: "success",
  PROCESSING: "default",
  PENDING: "warning",
  ON_HOLD: "warning",
  FAILED: "warning",
  CANCELLED: "muted",
  REFUNDED: "muted",
  CHECKOUT_DRAFT: "muted",
};

export const statusLabel = (s: string | null | undefined): string => STATUS_LABEL[s ?? ""] ?? "—";
export const statusTone = (s: string | null | undefined): "success" | "warning" | "muted" | "default" =>
  STATUS_TONE[s ?? ""] ?? "default";
