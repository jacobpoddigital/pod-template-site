import type { Metadata } from "next";
import Link from "next/link";
import { Minus, Plus, X, AlertCircle } from "lucide-react";
import { Section } from "@/ui/section";
import { ButtonLink } from "@/ui/button-link";
import { Button } from "@/ui/button";
import { FreeShippingBar } from "@/ui/free-shipping-bar";
import { CartTrustBar } from "@/ui/cart-trust-bar";
import { FitReassurance } from "@/ui/fit-reassurance";
import { CouponField } from "@/app/(shop)/_components/coupon-field";
import { getCart } from "@/lib/commerce/cart";
import { taxSuffix, CHECKOUT_ENABLED } from "@/lib/commerce/config";
import { getCartCrossSells } from "@/lib/commerce/related";
import { CartCrossSells } from "@/app/(shop)/_components/cart-cross-sells";
import { updateCartLine, removeCartLine } from "./_lib/actions";

// The cart is per-user + mutable — never cached (workflow/14: "WP down ≠ site down" does
// NOT hold here). Totals are read back server-authoritatively from the Store API.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default async function CartPage() {
  const cart = await getCart();
  const crossSells = cart.isEmpty
    ? []
    : await getCartCrossSells([...new Set(cart.lines.map((l) => l.productSlug).filter((s): s is string => Boolean(s)))], 8);

  return (
    <Section dataBlock="cart" padding="default" container="default">
      <h1 className="display-md text-foreground">Your bag</h1>

      {cart.errors.length > 0 && (
        <div role="alert" className="mt-6 space-y-2">
          {cart.errors.map((e, i) => (
            <p
              key={`${e.code}-${i}`}
              className="flex items-start gap-2 rounded-md border border-error/40 bg-error/5 p-3 body-sm text-error"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{e.message}</span>
            </p>
          ))}
        </div>
      )}

      {cart.isEmpty ? (
        <div className="mt-8">
          <p className="body text-muted-foreground">Your bag is empty.</p>
          <ButtonLink href="/shop" className="mt-6">Browse running shoes</ButtonLink>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_20rem]">
          <ul className="divide-y divide-border border-y border-border">
            {cart.lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-5">
                <div className="flex-1">
                  <h2 className="display-xs text-foreground">{line.name}</h2>
                  {line.options.length > 0 && (
                    <p className="mt-1 body-sm text-muted-foreground">
                      {line.options.map((o) => `${o.label}: ${o.value}`).join(" · ")}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center rounded-md border border-border">
                      <form action={updateCartLine}>
                        <input type="hidden" name="key" value={line.key} />
                        <input type="hidden" name="quantity" value={line.quantity - 1} />
                        <button
                          type="submit"
                          aria-label={`Decrease ${line.name} quantity`}
                          className="flex size-11 items-center justify-center text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Minus className="size-4" aria-hidden="true" />
                        </button>
                      </form>
                      <span className="min-w-8 text-center body-sm font-medium text-foreground" aria-live="polite">
                        {line.quantity}
                      </span>
                      <form action={updateCartLine}>
                        <input type="hidden" name="key" value={line.key} />
                        <input type="hidden" name="quantity" value={line.quantity + 1} />
                        <button
                          type="submit"
                          disabled={!line.quantityLimits.editable || line.quantity >= line.quantityLimits.max}
                          aria-label={`Increase ${line.name} quantity`}
                          className="flex size-11 items-center justify-center text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          <Plus className="size-4" aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                    <form action={removeCartLine}>
                      <input type="hidden" name="key" value={line.key} />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center gap-1 body-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="size-4" aria-hidden="true" /> Remove
                      </button>
                    </form>
                  </div>
                  {line.lowStockRemaining != null ? (
                    <p className="mt-2 body-sm text-warning">Only {line.lowStockRemaining} left</p>
                  ) : line.quantity >= line.quantityLimits.max ? (
                    <p className="mt-2 body-sm text-muted-foreground">Max quantity reached</p>
                  ) : null}
                </div>
                <p className="body font-semibold text-foreground">{line.lineTotal}</p>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-lg border border-border bg-surface-muted p-6">
            <h2 className="display-xs text-foreground">Order summary</h2>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="body text-muted-foreground">Subtotal ({cart.itemCount})</span>
              <span className="body font-semibold text-foreground">
                {cart.total}
                {taxSuffix() && <span className="ml-1.5 body-sm font-normal text-muted-foreground">{taxSuffix()}</span>}
              </span>
            </div>
            {cart.discountTotal && (
              <div className="mt-2 flex items-center justify-between body-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-success">−{cart.discountTotal}</span>
              </div>
            )}
            <p className="mt-2 body-sm text-muted-foreground">Shipping calculated at checkout.</p>
            <div className="mt-4">
              <CouponField coupons={cart.coupons} />
            </div>
            <FreeShippingBar subtotalMinor={cart.subtotalMinor} currency={cart.currency} className="mt-4" />
            {CHECKOUT_ENABLED ? (
              <ButtonLink href="/checkout" size="md" className="mt-6 w-full">
                Checkout
              </ButtonLink>
            ) : (
              <Button type="button" size="md" disabled className="mt-6 w-full">
                Checkout (M3)
              </Button>
            )}
            <Link
              href="/shop"
              className="mt-3 block text-center body-sm text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Continue shopping
            </Link>
            <FitReassurance className="mt-5" />
            <CartTrustBar className="mt-5 justify-center border-t border-border pt-5" />
          </aside>
        </div>
      )}

      <CartCrossSells products={crossSells} />
    </Section>
  );
}
