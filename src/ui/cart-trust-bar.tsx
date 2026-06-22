import { Lock, RefreshCw, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/commerce/config";

// Cart trust micro-bar (Baymard: trust signals at the decision point lift completion ~12–17%; the
// wireframe's C3 "cart--trust-bar"). 2–3 signals only. Reused on BOTH cart surfaces (mini-cart drawer
// + /cart) and the checkout summary's signals mirror it. The free-delivery label derives from
// FREE_SHIPPING_THRESHOLD so it never drifts from the actual nudge/threshold. Border-not-shadow.
export function CartTrustBar({ className }: { className?: string }) {
  const delivery = FREE_SHIPPING_THRESHOLD != null ? `Free delivery over £${FREE_SHIPPING_THRESHOLD}` : "Free UK delivery";
  const items = [
    { icon: Lock, label: "Secure checkout" },
    { icon: RefreshCw, label: "Free exchanges" },
    { icon: Truck, label: delivery },
  ];
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="inline-flex items-center gap-1.5 body-sm text-muted-foreground">
          <Icon className="size-3.5 shrink-0 text-foreground" aria-hidden="true" /> {label}
        </li>
      ))}
    </ul>
  );
}
