"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ProductVariation } from "@/lib/commerce/products";

// Shares the live buy-box CTA state from the VariationSelector to the mobile sticky bar, so the bar
// mirrors the real selection/stock state instead of a static "Select size" label:
//  - "select" → nothing chosen yet: the bar scrolls to the buy box.
//  - "add"    → a buyable item is resolved (incl. backorder): the bar adds it (and opens the drawer).
//  - "oos"    → the product / chosen combo is out of stock: the bar is disabled.
// Two contexts: the STATE (for the sticky bar) and the SETTER (stable identity, for the publisher) —
// so the publishing selector never re-renders from its own updates (no loop, no refs-in-render).
export type BuyCta = {
  kind: "select" | "add" | "oos";
  label: string;
  price: string | null;
  onAdd?: () => void;
};

const StateCtx = createContext<BuyCta | null>(null);
const SetCtx = createContext<((cta: BuyCta) => void) | null>(null);

export function BuyCtaProvider({ price, children }: { price: string | null; children: ReactNode }) {
  const [cta, setCta] = useState<BuyCta>({ kind: "select", label: "Select size & add to bag", price });
  return (
    <SetCtx.Provider value={setCta}>
      <StateCtx.Provider value={cta}>{children}</StateCtx.Provider>
    </SetCtx.Provider>
  );
}

/** The current CTA state — for the sticky bar. Null outside a provider. */
export const useBuyCta = () => useContext(StateCtx);

// The CTA the sticky bar should show for the buy box's current state.
function stickyCtaState(a: {
  wholeOOS: boolean; isSimple: boolean; matched: ProductVariation | null; canBuy: boolean;
  onBackorder: boolean; isPending: boolean; price: string | null; onAdd: () => void;
}): BuyCta {
  if (a.wholeOOS) return { kind: "oos", label: "Out of stock", price: a.price };
  if (!a.isSimple && !a.matched) return { kind: "select", label: "Select size & add to bag", price: a.price };
  if (!a.canBuy) return { kind: "oos", label: "Out of stock", price: a.price };
  const label = a.isPending ? "Adding…" : a.onBackorder ? "Add to bag — on backorder" : "Add to bag";
  return { kind: "add", label, price: a.price, onAdd: a.onAdd };
}

/** Publish the buy box's CTA state to the sticky bar. The setter is stable, so this never loops. */
export function usePublishCta(p: {
  wholeOOS: boolean; isSimple: boolean; matched: ProductVariation | null; canBuy: boolean;
  onBackorder: boolean; isPending: boolean; basePrice: string | null; buyId: number | undefined; qty: number;
  addToBag: (id: number | undefined, q: number) => void;
}) {
  const setCta = useContext(SetCtx);
  const { wholeOOS, isSimple, matched, canBuy, onBackorder, isPending, basePrice, buyId, qty, addToBag } = p;
  const price = matched?.price ?? basePrice;
  useEffect(() => {
    setCta?.(
      stickyCtaState({ wholeOOS, isSimple, matched, canBuy, onBackorder, isPending, price, onAdd: () => addToBag(buyId, qty) }),
    );
  }, [setCta, wholeOOS, isSimple, matched, canBuy, onBackorder, isPending, price, buyId, qty, addToBag]);
}
