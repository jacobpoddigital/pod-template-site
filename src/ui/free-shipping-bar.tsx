import { Truck, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney, freeShippingProgress, type CartCurrency } from "@/lib/commerce/config";

// Display-only free-shipping-threshold nudge (a merchandising progress meter, NOT a shipping calc —
// the real rule lives in Woo's shipping zones, applied at checkout/M3; see FREE_SHIPPING_THRESHOLD).
// Pure + server/client safe so BOTH cart surfaces use it (server /cart page + client mini-cart
// drawer). Renders nothing when no threshold is configured or the cart is empty. Border + visible
// track (no shadow) per the agency surface style; the meter has an explicit track so progress reads.
export function FreeShippingBar({
  subtotalMinor,
  currency,
  className,
}: {
  subtotalMinor: number;
  currency: CartCurrency;
  className?: string;
}) {
  const state = freeShippingProgress(subtotalMinor, currency.minorUnit);
  if (!state) return null;

  const { remainingMinor, qualified, pct } = state;
  const message = qualified ? (
    <>
      <Check className="size-4 shrink-0 text-success" aria-hidden="true" />
      <span>
        You&apos;ve unlocked <span className="font-semibold text-foreground">free shipping</span>.
      </span>
    </>
  ) : (
    <>
      <Truck className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span>
        You&apos;re <span className="font-semibold text-foreground">{formatMoney(remainingMinor, currency)}</span> away
        from free shipping.
      </span>
    </>
  );

  return (
    <div className={cn("rounded-md border border-border bg-surface-raised p-3", className)}>
      <p className="flex items-center gap-2 body-sm text-muted-foreground">{message}</p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Progress towards free shipping"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-300", qualified ? "bg-success" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
