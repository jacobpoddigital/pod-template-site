import { Badge } from "@/ui/badge";
import { statusLabel, statusTone } from "@/lib/commerce/order-status";

// Order status → a toned badge (success = done, warning = needs attention, muted = inactive).
export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge variant={statusTone(status)}>{statusLabel(status)}</Badge>;
}
