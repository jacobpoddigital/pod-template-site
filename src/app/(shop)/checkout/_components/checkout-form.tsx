"use client";

import { useState } from "react";
import { AlertCircle, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { CartTrustBar } from "@/ui/cart-trust-bar";
import { CouponField } from "@/app/(shop)/_components/coupon-field";
import { AddressForm, EMPTY_ADDRESS } from "@/app/(shop)/_components/address-form";
import type { Cart } from "@/lib/commerce/cart";
import type { Address, CheckoutQuote } from "@/lib/commerce/checkout";
import { useCheckoutQuote, usePlaceOrder } from "../_lib/use-checkout-quote";

type PaymentMethod = { id: string; label: string; description: string };

const firstPaymentId = (methods: PaymentMethod[]) => methods[0]?.id ?? "cheque";

// ── delivery rates ─────────────────────────────────────────────────────────────
function DeliveryRates({ quote, selected, onSelect, disabled }: {
  quote: CheckoutQuote; selected: string; onSelect: (id: string) => void; disabled: boolean;
}) {
  if (quote.rates.length === 0) return <p className="body-sm text-muted-foreground">No delivery options for this address.</p>;
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="sr-only">Delivery option</legend>
      {quote.rates.map((r) => (
        <label key={r.rateId} className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-surface-raised p-3 has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
          <span className="flex items-center gap-3">
            <input type="radio" name="rate" value={r.rateId} checked={selected === r.rateId} onChange={() => onSelect(r.rateId)} className="size-4 accent-primary" />
            <span className="body text-foreground">{r.name}</span>
          </span>
          <span className="body font-semibold text-foreground">{r.price}</span>
        </label>
      ))}
    </fieldset>
  );
}

// ── delivery section (rates + a live re-quote loading state) ────────────────────
function DeliverySection({ quote, rate, quoting, pending, onSelect }: {
  quote: CheckoutQuote; rate: string; quoting: boolean; pending: boolean; onSelect: (id: string) => void;
}) {
  return (
    <section aria-labelledby="delivery-h">
      <h2 id="delivery-h" className="display-xs text-foreground">Delivery</h2>
      <div className="mt-4">
        {quoting ? (
          <p className="mb-3 inline-flex items-center gap-2 body-sm text-muted-foreground" role="status" aria-live="polite">
            <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" /> Updating delivery options for your address…
          </p>
        ) : null}
        <div className={quoting ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={quoting}>
          <DeliveryRates quote={quote} selected={rate} onSelect={onSelect} disabled={pending} />
        </div>
      </div>
    </section>
  );
}

// ── payment ───────────────────────────────────────────────────────────────────
function Payment({ methods, selected, onSelect }: { methods: PaymentMethod[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Payment method</legend>
      {methods.map((m) => (
        <label key={m.id} className="block cursor-pointer rounded-md border border-border bg-surface-raised p-3 has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
          <span className="flex items-center gap-3">
            <input type="radio" name="payment" value={m.id} checked={selected === m.id} onChange={() => onSelect(m.id)} className="size-4 accent-primary" />
            <span className="body font-medium text-foreground">{m.label}</span>
          </span>
          <span className="mt-1 block pl-7 body-sm text-muted-foreground">{m.description}</span>
        </label>
      ))}
    </fieldset>
  );
}

// ── order summary (line items + totals + discount + coupon) ─────────────────────
function OrderSummary({ cart, quote, quoting, onCouponChanged }: { cart: Cart; quote: CheckoutQuote | null; quoting: boolean; onCouponChanged: () => void }) {
  return (
    <aside className="h-fit rounded-lg border border-border bg-surface-muted p-6">
      <h2 className="display-xs text-foreground">Order summary</h2>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {cart.lines.map((line) => (
          <li key={line.key} className="flex items-start justify-between gap-3 py-3">
            <span className="body-sm text-foreground">
              {line.name} <span className="text-muted-foreground">× {line.quantity}</span>
            </span>
            <span className="body-sm font-medium text-foreground">{line.lineTotal}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <CouponField coupons={cart.coupons} onChanged={onCouponChanged} />
      </div>
      <dl className="mt-4 space-y-2">
        <div className="flex justify-between body-sm">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-foreground">{cart.total}</dd>
        </div>
        {cart.discountTotal && (
          <div className="flex justify-between body-sm">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="text-success">−{cart.discountTotal}</dd>
          </div>
        )}
        <div className="flex justify-between body-sm">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="text-foreground" aria-live="polite">
            {quoting ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="size-3.5 motion-safe:animate-spin" aria-hidden="true" /> Calculating…
              </span>
            ) : (
              quote?.totals.shipping ?? "Enter address"
            )}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 body font-semibold">
          <dt className="text-foreground">Total</dt>
          <dd className={quoting ? "text-muted-foreground transition-colors" : "text-foreground transition-colors"}>
            {quote?.totals.total ?? cart.total}
          </dd>
        </div>
      </dl>
      <CartTrustBar className="mt-5 border-t border-border pt-4" />
    </aside>
  );
}

// "Ship to a different address" toggle + the optional shipping address block.
function ShippingToggle({ on, onToggle, shipping, onShippingChange }: {
  on: boolean; onToggle: (v: boolean) => void; shipping: Address; onShippingChange: (k: keyof Address, v: string) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-2.5 body-sm text-foreground">
        <input type="checkbox" checked={on} onChange={(e) => onToggle(e.target.checked)} className="size-4 accent-primary" />
        Ship to a different address
      </label>
      {on && (
        <div className="mt-4">
          <AddressForm idPrefix="ship" address={shipping} onChange={onShippingChange} showEmail={false} />
        </div>
      )}
    </div>
  );
}

export function CheckoutForm({ cart, paymentMethods }: { cart: Cart; paymentMethods: PaymentMethod[] }) {
  const [billing, setBilling] = useState<Address>(EMPTY_ADDRESS);
  const [shipDifferent, setShipDifferent] = useState(false);
  const [shipping, setShipping] = useState<Address>(EMPTY_ADDRESS);
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState(firstPaymentId(paymentMethods));

  const onBilling = (k: keyof Address, v: string) => setBilling((a) => ({ ...a, [k]: v }));
  const onShipping = (k: keyof Address, v: string) => setShipping((a) => ({ ...a, [k]: v }));
  const shipTo = () => (shipDifferent ? shipping : undefined);

  // The update-customer → re-quote seam (incl. debounced re-quote on an address edit). Reused, in
  // server-action form, by the account Addresses editor.
  const { quote, rate, error, pending: quoting, setError, getQuote, chooseRate, runQuote } = useCheckoutQuote(billing, shipTo());
  const { placing, place: submitOrder } = usePlaceOrder(setError);
  const pending = quoting || placing;
  const canPlace = Boolean(quote && rate);
  const onCouponChanged = () => {
    if (quote) runQuote();
  };

  const place = () => {
    if (!canPlace) return setError("Please calculate and choose a delivery option first.");
    setError(null);
    submitOrder({ billing, shipping: shipTo(), paymentMethod: payment, note: note.trim() || undefined, total: quote!.totals.total, itemCount: cart.itemCount });
  };

  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        <p className="body-sm text-muted-foreground">Checking out as a guest — no account needed.</p>

        <section aria-labelledby="contact-h">
          <h2 id="contact-h" className="display-xs text-foreground">Contact &amp; billing address</h2>
          <div className="mt-4">
            <AddressForm idPrefix="bill" address={billing} onChange={onBilling} showEmail />
          </div>
          <div className="mt-5">
            <ShippingToggle on={shipDifferent} onToggle={setShipDifferent} shipping={shipping} onShippingChange={onShipping} />
          </div>
          {!quote && (
            <Button type="button" size="md" onClick={getQuote} disabled={pending} className="mt-5">
              {pending ? "Calculating…" : "Calculate delivery"}
            </Button>
          )}
        </section>

        {quote && <DeliverySection quote={quote} rate={rate} quoting={quoting} pending={pending} onSelect={chooseRate} />}

        <section aria-labelledby="payment-h">
          <h2 id="payment-h" className="display-xs text-foreground">Payment</h2>
          <div className="mt-4">
            <Payment methods={paymentMethods} selected={payment} onSelect={setPayment} />
          </div>
        </section>

        <section aria-labelledby="notes-h">
          <h2 id="notes-h" className="display-xs text-foreground">Order notes (optional)</h2>
          <Textarea
            id="order-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Delivery instructions, gift message, etc."
            className="mt-3"
            rows={3}
          />
        </section>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-md border border-error/40 bg-error/5 p-3 body-sm text-error">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> <span>{error}</span>
          </p>
        )}

        <Button type="button" size="lg" onClick={place} disabled={pending || !canPlace} className="w-full sm:w-auto">
          <ShieldCheck className="size-4" aria-hidden="true" /> {pending ? "Placing order…" : "Place order"}
        </Button>
      </div>

      <OrderSummary cart={cart} quote={quote} quoting={quoting} onCouponChanged={onCouponChanged} />
    </div>
  );
}
