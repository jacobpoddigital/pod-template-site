"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { QuantityStepper } from "@/ui/quantity-stepper";
import { addToCartAction } from "@/app/(shop)/cart/_lib/actions";
import { saleMeta, stockLabel, lowStockThreshold, type StockState, type BackorderMode } from "@/lib/commerce/pricing";
import type { ProductOption, ProductVariation } from "@/lib/commerce/products";
import { useColourGallery } from "@/app/(shop)/_components/colour-gallery";
import { usePublishCta } from "./buy-cta-context";
import { ColourSwatch, ValueChip, OutOfStockNotice } from "./variation-values";

const norm = (s: string) => s.trim().toLowerCase();
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const isColour = (name: string) => /colou?r/.test(norm(name));

// Merchant default variation → the initial selection. Woo default-attribute names can carry a
// `pa_` taxonomy prefix (global attrs) while our option names don't, so match with the prefix
// stripped on both sides; only pre-select a value that actually exists on the option (so a stale
// default never selects a non-existent value). Returns {} when there are no usable defaults.
function initialSelection(options: ProductOption[], defaults: { name: string; value: string }[]): Record<string, string> {
  const bare = (s: string) => norm(s).replace(/^pa_/, "");
  const sel: Record<string, string> = {};
  for (const o of options) {
    const key = norm(o.name);
    const def = defaults.find((d) => bare(d.name) === bare(o.name));
    if (!def) continue;
    const match = o.values.find((v) => norm(v) === norm(def.value));
    if (match) sel[key] = match;
  }
  return sel;
}

// The chosen colourway value in a selection map (the value under the colour-named key), or null.
const colourOf = (sel: Record<string, string>): string | null =>
  Object.entries(sel).find(([k]) => isColour(k))?.[1] ?? null;

// Lazy-init the selection from the merchant default + swap the gallery to a default colourway once
// on mount. Kept as a hook so VariationSelector itself stays under the complexity ceiling.
function useDefaultSelection(
  options: ProductOption[],
  defaultAttributes: { name: string; value: string }[],
  setSelectedColour: (c: string) => void,
) {
  const state = useState<Record<string, string>>(() => initialSelection(options, defaultAttributes));
  const selected = state[0];
  useEffect(() => {
    const c = colourOf(selected);
    if (c) setSelectedColour(c);
    // run once on mount for the merchant default; user picks drive it thereafter via `select`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}

// Per-variation copy (Woo Variations tab) — rendered only once an exact variation resolves.
function VariationDescription({ variation }: { variation: ProductVariation | null }) {
  if (!variation?.description) return null;
  return <p className="-mt-2 max-w-[60ch] body-sm text-muted-foreground">{variation.description}</p>;
}

// Add-to-bag state + handler (the Store API write via the cart Server Action). Kept as a hook so
// VariationSelector stays under the complexity ceiling. `addToBag` takes the resolved buyable id.
function useAddToBag() {
  const [note, setNote] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const resetAdd = useCallback(() => {
    setNote(null);
    setAdded(false);
  }, []);
  const addToBag = useCallback((buyId: number | undefined, qty: number) => {
    if (!buyId) return;
    resetAdd();
    startTransition(async () => {
      const res = await addToCartAction(buyId, qty);
      if (!res.ok) return setNote(res.error ?? "Couldn't add to bag.");
      setAdded(true);
      window.dispatchEvent(new Event("cart:changed"));
      window.dispatchEvent(new Event("cart:open"));
    });
  }, [resetAdd]);
  return { note, added, isPending, addToBag, resetAdd };
}

// Resolve the chosen option values → the matching variation (attribute name+value, normalised).
function findVariation(variations: ProductVariation[], selected: Record<string, string>): ProductVariation | null {
  return (
    variations.find((v) => v.attributes.every((a) => norm(selected[norm(a.name)] ?? "") === norm(a.value))) ?? null
  );
}

// {isSimple, allChosen, matched} for the current selection — extracted to keep VariationSelector
// under the complexity ceiling.
function useMatched(options: ProductOption[], variations: ProductVariation[], selected: Record<string, string>) {
  const isSimple = options.length === 0;
  const allChosen = !isSimple && options.every((o) => selected[norm(o.name)]);
  const matched = useMemo(() => (allChosen ? findVariation(variations, selected) : null), [allChosen, selected, variations]);
  return { isSimple, allChosen, matched };
}

// Is `value` for `optionKey` reachable given the OTHER current selections, with stock? Powers
// dimming unavailable option values (e.g. the out-of-stock Volt colourway) instead of letting a
// shopper pick a dead combination — the "show-but-disable, never hide" stance from the filters.
function valueReachable(
  variations: ProductVariation[],
  selected: Record<string, string>,
  optionKey: string,
  value: string,
): boolean {
  return variations.some((v) => {
    if (!v.inStock) return false;
    const attrs = Object.fromEntries(v.attributes.map((a) => [norm(a.name), norm(a.value)]));
    if (attrs[optionKey] !== norm(value)) return false;
    return Object.entries(selected).every(([k, val]) => k === optionKey || !val || attrs[k] === norm(val));
  });
}

type Tone = "muted" | "warning" | "error";
const TONE: Record<Tone, string> = { muted: "text-muted-foreground", warning: "text-warning", error: "text-error" };

// "£169 (was £235) · Only 3 left" — sale-aware price + per-variation stock for the chosen combo.
function priceLine(matched: ProductVariation): string {
  const m = saleMeta(matched);
  const stock = stockLabel(matched.stockStatus, matched.stockQuantity, {
    backorder: matched.backorders,
    threshold: lowStockThreshold(matched.lowStockAmount),
  });
  const price = m.onSale && m.regular ? `${m.active} (was ${m.regular})` : matched.price ?? "";
  return [price, stock ?? "In stock"].filter(Boolean).join(" · ");
}

function variationStatus(matched: ProductVariation | null, allChosen: boolean): { text: string; tone: Tone } {
  if (!matched) return { text: allChosen ? "That combination isn't available" : "Select your options", tone: allChosen ? "error" : "muted" };
  if (!matched.inStock && matched.stockStatus !== "ON_BACKORDER") return { text: "Selected combination is out of stock", tone: "error" };
  const low = stockLabel(matched.stockStatus, matched.stockQuantity, {
    backorder: matched.backorders,
    threshold: lowStockThreshold(matched.lowStockAmount),
  });
  return { text: priceLine(matched), tone: low ? "warning" : "muted" };
}

// Resolve the buyable id + availability from the current selection (variable) or the product
// itself (simple). Kept separate so the component stays flat.
type BuyContext = {
  isSimple: boolean;
  matched: ProductVariation | null;
  productId: number;
  stockStatus: StockState;
  parentStockQty: number | null;
  parentBackorders: BackorderMode;
};

type Buyable = { buyId: number | undefined; canBuy: boolean; onBackorder: boolean; stockQty: number | null; backorders: BackorderMode };

// `onBackorder` is the DISPLAY flag (drives "on backorder" copy); a SILENT (YES) backorder reads as
// in stock so it's false there. `canBuy` stays true for any orderable backorder. (Kept out of
// resolveBuy to hold its cyclomatic complexity under the lint ceiling.)
function availability(onBack: boolean, backorders: BackorderMode, inStock: boolean): { canBuy: boolean; onBackorder: boolean } {
  return { canBuy: inStock || onBack, onBackorder: onBack && backorders !== "YES" };
}

// The product is unavailable when the parent says OUT_OF_STOCK, OR it's a variable product whose
// EVERY variation is unbuyable (out of stock, no backorder) — that latter case has a parent
// stockStatus that isn't OUT_OF_STOCK, so it must be detected from the variations.
function isUnavailable(stockStatus: StockState, isSimple: boolean, variations: ProductVariation[]): boolean {
  if (stockStatus === "OUT_OF_STOCK") return true;
  if (isSimple || variations.length === 0) return false;
  return !variations.some((v) => v.inStock || v.stockStatus === "ON_BACKORDER");
}

function resolveBuy(c: BuyContext): Buyable {
  if (c.isSimple) {
    const a = availability(c.stockStatus === "ON_BACKORDER", c.parentBackorders, true);
    return { buyId: c.productId, canBuy: a.canBuy, onBackorder: a.onBackorder, stockQty: c.parentStockQty, backorders: c.parentBackorders };
  }
  const onBack = c.matched?.stockStatus === "ON_BACKORDER";
  const backorders = c.matched?.backorders ?? "NO";
  const a = availability(onBack, backorders, Boolean(c.matched?.inStock));
  return {
    buyId: c.matched?.id,
    canBuy: Boolean(c.matched) && a.canBuy,
    onBackorder: a.onBackorder,
    stockQty: c.matched?.stockQuantity ?? null,
    backorders,
  };
}

// Upper bound for the qty stepper: 1 if sold individually; remaining stock when backorders are off
// and stock is managed; otherwise unbounded (backorders allowed, or stock isn't managed).
function maxQty(soldIndividually: boolean, stockQty: number | null, backorders: BackorderMode): number | null {
  if (soldIndividually) return 1;
  if (backorders === "NO" && stockQty != null && stockQty > 0) return stockQty;
  return null;
}

// Resolve the qty stepper's bound + clamped value + whether to show it, from the buyable item.
// `max` is honoured from stock / sold-individually; `min`/`step` use the stepper's defaults (1/1).
// Woo's per-product MIN / STEP / group-of quantities come from the "Min/Max Quantities" extension and
// are NOT in core WooGraphQL (verified: no minimumQuantity/groupOf field on the schema). When a client
// runs that extension + a WooGraphQL bridge, thread the values into the QuantityStepper `min`/`step`
// props below — the primitive already snaps to them. See docs/woocommerce-coverage.md §3.
function qtyState(buy: Buyable, soldIndividually: boolean, qty: number): { max: number | null; value: number; show: boolean } {
  const max = maxQty(soldIndividually, buy.stockQty, buy.backorders);
  const value = Math.max(1, max != null ? Math.min(qty, max) : qty);
  const show = buy.canBuy && !soldIndividually && Boolean(buy.buyId);
  return { max, value, show };
}

// ── option-value buttons (ColourSwatch / ValueChip) live in ./variation-values ──────────────
// ARIA radiogroup keyboard pattern: arrow keys move + select within a group.
const ARROW: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

// Next radio index for an arrow keypress, or null if the key isn't an arrow. Pulled out of the
// component to keep VariationSelector under the complexity ceiling.
function arrowTarget(e: React.KeyboardEvent<HTMLDivElement>, values: string[], current: string): number | null {
  const dir = ARROW[e.key];
  if (!dir) return null;
  e.preventDefault();
  const cur = values.indexOf(current);
  return ((cur < 0 ? 0 : cur) + dir + values.length) % values.length;
}

// One attribute axis (Size / Width / Colour) as an ARIA radiogroup.
function OptionGroup({
  option,
  selected,
  variations,
  onSelect,
  onArrow,
}: {
  option: ProductOption;
  selected: Record<string, string>;
  variations: ProductVariation[];
  onSelect: (key: string, value: string) => void;
  onArrow: (e: React.KeyboardEvent<HTMLDivElement>, values: string[], key: string) => void;
}) {
  const key = norm(option.name);
  const Value = isColour(option.name) ? ColourSwatch : ValueChip;
  return (
    <fieldset>
      <legend className="mb-2 body-sm font-semibold text-foreground">{titleCase(option.name)}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={option.name} onKeyDown={(e) => onArrow(e, option.values, key)}>
        {option.values.map((value, idx) => (
          <Value
            key={value}
            value={value}
            isSelected={selected[key] === value}
            reachable={valueReachable(variations, selected, key, value)}
            tabbable={selected[key] ? selected[key] === value : idx === 0}
            onSelect={() => onSelect(key, value)}
          />
        ))}
      </div>
    </fieldset>
  );
}

// ── buy action (button + post-add messaging) ───────────────────────────────
function BuyAction({
  canBuy,
  isPending,
  onBackorder,
  added,
  note,
  onAdd,
}: {
  canBuy: boolean;
  isPending: boolean;
  onBackorder: boolean;
  added: boolean;
  note: string | null;
  onAdd: () => void;
}) {
  const label = isPending ? "Adding…" : onBackorder ? "Add to bag — on backorder" : "Add to bag";
  return (
    <div>
      <Button type="button" size="md" disabled={!canBuy || isPending} onClick={onAdd} className="w-full">
        {label}
      </Button>
      {onBackorder && canBuy && <p className="mt-2 body-sm text-warning">Ships when back in stock — you can order now.</p>}
      {added && (
        <p className="mt-3 body-sm text-foreground" aria-live="polite">
          Added to bag.{" "}
          <Link href="/cart" className="text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            View bag
          </Link>
        </p>
      )}
      {note && <p className="mt-3 body-sm text-error" aria-live="polite">{note}</p>}
    </div>
  );
}

// PDP buy control. Variable products → resolve size/width/colour to a concrete variation (with
// per-variation stock + sale), then add it to the Store API cart. Simple products (no options) →
// add the product itself directly. Whole-product OOS short-circuits to a notice.
export function VariationSelector({
  productId,
  options,
  variations,
  defaultAttributes = [],
  stockStatus = "IN_STOCK",
  stockQuantity = null,
  soldIndividually = false,
  backorders = "NO",
  basePrice = null,
}: {
  productId: number;
  options: ProductOption[];
  variations: ProductVariation[];
  defaultAttributes?: { name: string; value: string }[];
  stockStatus?: StockState;
  stockQuantity?: number | null;
  soldIndividually?: boolean;
  backorders?: BackorderMode;
  basePrice?: string | null;
}) {
  const [qty, setQty] = useState(1);
  const { note, added, isPending, addToBag, resetAdd } = useAddToBag();
  const { setSelectedColour } = useColourGallery();
  // Pre-select the merchant default variation (so the PDP opens on the chosen combo, not blank) +
  // swap the gallery to a default colourway on mount.
  const [selected, setSelected] = useDefaultSelection(options, defaultAttributes, setSelectedColour);

  const { isSimple, allChosen, matched } = useMatched(options, variations, selected);

  const select = (key: string, value: string) => {
    setSelected((s) => ({ ...s, [key]: value }));
    if (isColour(key)) setSelectedColour(value); // swap the gallery to the chosen colourway
    setQty(1); // reset qty when the variation changes (its stock ceiling may differ)
    resetAdd();
  };

  const onArrow = (e: React.KeyboardEvent<HTMLDivElement>, values: string[], key: string) => {
    const next = arrowTarget(e, values, selected[key] ?? "");
    if (next == null) return;
    select(key, values[next]!);
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };

  const wholeOOS = isUnavailable(stockStatus, isSimple, variations);
  const buy = resolveBuy({ isSimple, matched, productId, stockStatus, parentStockQty: stockQuantity, parentBackorders: backorders });
  const { buyId, canBuy, onBackorder } = buy;
  const { max, value: effectiveQty, show: showQty } = qtyState(buy, soldIndividually, qty);
  const status = variationStatus(matched, allChosen);

  // Mirror this state to the mobile sticky bar (runs in all branches incl. the OOS early return).
  usePublishCta({ wholeOOS, isSimple, matched, canBuy, onBackorder, isPending, basePrice, buyId, qty: effectiveQty, addToBag });

  if (wholeOOS) return <OutOfStockNotice />;

  return (
    <div className="flex flex-col gap-6">
      {options.map((option) => (
        <OptionGroup key={option.name} option={option} selected={selected} variations={variations} onSelect={select} onArrow={onArrow} />
      ))}
      {!isSimple && <div aria-live="polite" className={cn("min-h-6 body-sm", TONE[status.tone])}>{status.text}</div>}
      <VariationDescription variation={matched} />
      {showQty && (
        <div className="flex items-center gap-3">
          <span id="qty-label" className="body-sm font-semibold text-foreground">Quantity</span>
          <QuantityStepper value={effectiveQty} onChange={setQty} max={max} disabled={isPending} label="Quantity" />
        </div>
      )}
      <BuyAction canBuy={canBuy} isPending={isPending} onBackorder={Boolean(onBackorder)} added={added} note={note} onAdd={() => addToBag(buyId, effectiveQty)} />
    </div>
  );
}
