"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ShoppingBag } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/ui/sheet";
import type { Cart } from "@/lib/commerce/cart";
import type { ProductCard as ProductCardData } from "@/lib/commerce/products";
import { CartDrawerBody } from "./cart-drawer-body";

// Header cart entry — a slide-in mini-cart drawer (Sheet) on top of the full /cart page. The header
// is a server component in the root layout, so the cart hydrates client-side from /api/cart (full
// Cart incl. lines) to keep static pages static. Refetches on the `cart:changed` window event (badge
// stays truthful) and opens on `cart:open` (dispatched after add-to-bag). The drawer BODY (loading /
// empty / filled) lives in cart-drawer-body.tsx. Named CartButton so the header import is unchanged.
export function CartButton() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [crossSells, setCrossSells] = useState<ProductCardData[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadCrossSells = useCallback(() => {
    fetch("/api/cart/cross-sells", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: ProductCardData[]) => setCrossSells(Array.isArray(d) ? d : []))
      .catch(() => setCrossSells([]));
  }, []);

  // NB: don't setLoading(true) here — load() runs from effects, and a synchronous setState in an
  // effect cascades renders (lint). `loading` is raised in the OPEN handlers (event handlers) instead;
  // this only clears it (async, in .finally — allowed).
  const load = useCallback(() => {
    fetch("/api/cart", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Cart | null) => {
        if (d) setCart(d);
      })
      .catch(() => {
        /* network hiccup — leave the last known cart */
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const onChanged = () => load();
    const onOpen = () => {
      setLoading(true); // raise loading in the event handler (not the effect) so add-to-bag never flashes "empty"
      setOpen(true);
    };
    window.addEventListener("cart:changed", onChanged);
    window.addEventListener("cart:open", onOpen);
    window.addEventListener("focus", onChanged);
    return () => {
      window.removeEventListener("cart:changed", onChanged);
      window.removeEventListener("cart:open", onOpen);
      window.removeEventListener("focus", onChanged);
    };
  }, [load]);

  // Whenever the drawer opens (icon click OR post-add cart:open), refresh the cart + its cross-sells.
  useEffect(() => {
    if (!open) return;
    load();
    loadCrossSells();
  }, [open, load, loadCrossSells]);

  const setQuantity = (key: string, quantity: number) => {
    startTransition(async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, quantity }),
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as (Cart & { error?: string }) | null;
      if (res.ok && data) {
        setCart(data as Cart);
        setActionError(null);
        window.dispatchEvent(new Event("cart:changed"));
      } else {
        setActionError(data?.error ?? "Couldn't update your bag — please try again.");
      }
    });
  };

  const count = cart?.itemCount ?? 0;
  const has = count > 0;
  // Opening (icon click) raises loading here — not in an effect — so the open refetch shows the
  // loading state, never a stale "empty" flash.
  const onOpenChange = (next: boolean) => {
    if (next) setLoading(true);
    setOpen(next);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        aria-label={has ? `Basket, ${count} ${count === 1 ? "item" : "items"}` : "Basket"}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-card text-ink transition-colors hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        {has ? (
          <span
            className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] font-semibold leading-none text-primary-foreground"
            aria-hidden="true"
          >
            {count}
          </span>
        ) : null}
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full max-w-none flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Your bag{has ? ` (${count})` : ""}</SheetTitle>
        </SheetHeader>

        <CartDrawerBody
          cart={cart}
          loading={loading}
          isPending={isPending}
          crossSells={crossSells}
          actionError={actionError}
          onSetQuantity={setQuantity}
          onClose={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
