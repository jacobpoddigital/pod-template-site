"use client";

import Link from "next/link";
import { ShoppingBag, Minus, Plus, X, AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { FreeShippingBar } from "@/ui/free-shipping-bar";
import { CartTrustBar } from "@/ui/cart-trust-bar";
import { FitReassurance } from "@/ui/fit-reassurance";
import { cn } from "@/lib/utils";
import type { Cart } from "@/lib/commerce/cart";
import type { ProductCard as ProductCardData } from "@/lib/commerce/products";
import { taxSuffix, CHECKOUT_ENABLED } from "@/lib/commerce/config";

// The mini-cart drawer BODY (loading / empty / filled). Split out of cart-button.tsx so that file
// (the header entry + state/effects) stays under the complexity + line ceilings.

// Compact cross-sell row for the narrow drawer (header is in src/layout — the boundaries lint bars it
// from importing the app-level ProductCard/Price — so this is a ui/lib-only mini-card: thumbnail +
// name + price + a "View" link to the PDP, consistent with the no-blind-add stance).
function CrossSellRow({ product }: { product: ProductCardData }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <Link
        href={`/product/${product.slug}`}
        className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={product.name}
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image.url} alt={product.image.alt} className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <ShoppingBag className="size-5 text-muted-foreground/40" aria-hidden="true" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/product/${product.slug}`} className="block truncate body-sm font-medium text-foreground hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {product.name}
        </Link>
        {product.price && <p className="body-sm text-muted-foreground">{product.price}</p>}
      </div>
      <Link
        href={`/product/${product.slug}`}
        className="shrink-0 body-sm font-medium text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        View
      </Link>
    </li>
  );
}

// Cart validation notices (Woo's server-side cart.errors) + the last client write failure.
function CartNotices({ errors, actionError }: { errors: Cart["errors"]; actionError: string | null }) {
  if (errors.length === 0 && !actionError) return null;
  const items = [...errors.map((e, i) => ({ key: `${e.code}-${i}`, message: e.message }))];
  if (actionError) items.push({ key: "action-error", message: actionError });
  return (
    <div role="alert" className="space-y-2 px-6 pt-4">
      {items.map((it) => (
        <p key={it.key} className="flex items-start gap-2 rounded-md border border-error/40 bg-error/5 p-3 body-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{it.message}</span>
        </p>
      ))}
    </div>
  );
}

// Checkout CTA — real link when the (cheque POC) flow is on, else the disabled placeholder.
function CheckoutCta({ onNavigate }: { onNavigate: () => void }) {
  if (!CHECKOUT_ENABLED) {
    return (
      <Button type="button" size="md" disabled className="mt-6 w-full">
        Checkout (M3)
      </Button>
    );
  }
  return (
    <Link href="/checkout" onClick={onNavigate} className={cn(buttonVariants({ size: "md" }), "mt-6 w-full")}>
      Checkout
    </Link>
  );
}

function CartSubtotal({ total }: { total: string }) {
  const tax = taxSuffix();
  return (
    <div className="flex items-center justify-between">
      <span className="body text-muted-foreground">Subtotal</span>
      <span className="body font-semibold text-foreground">
        {total}
        {tax && <span className="ml-1.5 body-sm font-normal text-muted-foreground">{tax}</span>}
      </span>
    </div>
  );
}

// Loading state — shown while (re)fetching with no confirmed items, so add-to-bag never flashes the
// "empty" state before the line arrives.
function DrawerLoading() {
  return (
    <div className="flex-1 space-y-5 p-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your bag…</span>
      {[0, 1].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-11 w-32" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

// Empty state — the browse CTA closes the drawer (it covers the screen on mobile) before navigating.
function DrawerEmpty({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <p className="body text-muted-foreground">Your bag is empty.</p>
      <Link href="/shop" onClick={onBrowse} className={cn(buttonVariants({ size: "md" }))}>
        Browse running shoes
      </Link>
    </div>
  );
}

function CartLine({ line, isPending, onSetQuantity }: {
  line: Cart["lines"][number]; isPending: boolean; onSetQuantity: (key: string, qty: number) => void;
}) {
  return (
    <li className="flex gap-4 py-5">
      <div className="flex-1">
        <h3 className="body font-semibold text-foreground">{line.name}</h3>
        {line.options.length > 0 && (
          <p className="mt-1 body-sm text-muted-foreground">
            {line.options.map((o) => `${o.label}: ${o.value}`).join(" · ")}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <div className="inline-flex items-center rounded-md border border-border">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onSetQuantity(line.key, line.quantity - 1)}
              aria-label={`Decrease ${line.name} quantity`}
              className="flex size-11 items-center justify-center text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span className="min-w-8 text-center body-sm font-medium text-foreground" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              disabled={isPending || !line.quantityLimits.editable || line.quantity >= line.quantityLimits.max}
              onClick={() => onSetQuantity(line.key, line.quantity + 1)}
              aria-label={`Increase ${line.name} quantity`}
              className="flex size-11 items-center justify-center text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onSetQuantity(line.key, 0)}
            className="inline-flex min-h-11 items-center gap-1 body-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <X className="size-4" aria-hidden="true" /> Remove
          </button>
        </div>
        {line.lowStockRemaining != null ? (
          <p className="mt-2 body-sm text-warning">Only {line.lowStockRemaining} left</p>
        ) : line.quantity >= line.quantityLimits.max ? (
          <p className="mt-2 body-sm text-muted-foreground">Max quantity reached</p>
        ) : null}
      </div>
      <p className="body font-semibold text-foreground">{line.lineTotal}</p>
    </li>
  );
}

function FilledCart({ cart, isPending, crossSells, actionError, onSetQuantity, onClose }: {
  cart: Cart; isPending: boolean; crossSells: ProductCardData[]; actionError: string | null;
  onSetQuantity: (key: string, qty: number) => void; onClose: () => void;
}) {
  // Only the subtotal + checkout are PINNED (compact) so the bag's items stay visible on mobile,
  // where the drawer is full-screen. The non-transactional content (cross-sells, fit reassurance,
  // trust bar) scrolls with the items rather than eating the bottom of the viewport.
  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <CartNotices errors={cart.errors} actionError={actionError} />
        <ul className="divide-y divide-border px-6">
          {cart.lines.map((line) => (
            <CartLine key={line.key} line={line} isPending={isPending} onSetQuantity={onSetQuantity} />
          ))}
        </ul>

        {crossSells.length > 0 && (
          <div className="border-t border-border px-6 py-4">
            <h3 className="body-sm font-semibold text-foreground">You might also need</h3>
            <ul className="mt-1 divide-y divide-border">
              {crossSells.slice(0, 3).map((p) => (
                <CrossSellRow key={p.slug} product={p} />
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-border px-6 py-4">
          <FitReassurance />
          <CartTrustBar className="mt-4 justify-center" />
        </div>
      </div>

      <div className="border-t border-border p-4 sm:p-6">
        <FreeShippingBar subtotalMinor={cart.subtotalMinor} currency={cart.currency} className="mb-3" />
        {cart.discountTotal && (
          <div className="mb-1 flex items-center justify-between body-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium text-success">−{cart.discountTotal}</span>
          </div>
        )}
        <CartSubtotal total={cart.total} />
        <p className="mt-1 body-sm text-muted-foreground">Shipping calculated at checkout.</p>
        <CheckoutCta onNavigate={onClose} />
        <Link
          href="/cart"
          onClick={onClose}
          className="mt-3 block text-center body-sm text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View full bag
        </Link>
      </div>
    </>
  );
}

// The drawer body switch. "loading" wins while fetching with no confirmed items (no empty-flash).
export function CartDrawerBody({ cart, loading, isPending, crossSells, actionError, onSetQuantity, onClose }: {
  cart: Cart | null; loading: boolean; isPending: boolean; crossSells: ProductCardData[];
  actionError: string | null; onSetQuantity: (key: string, qty: number) => void; onClose: () => void;
}) {
  if (!cart || cart.isEmpty) {
    return loading ? <DrawerLoading /> : <DrawerEmpty onBrowse={onClose} />;
  }
  return (
    <FilledCart
      cart={cart}
      isPending={isPending}
      crossSells={crossSells}
      actionError={actionError}
      onSetQuantity={onSetQuantity}
      onClose={onClose}
    />
  );
}
