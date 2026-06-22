"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { firstMissingAddress, shippingKey } from "@/app/(shop)/_components/address-form";
import type { Address, CheckoutQuote } from "@/lib/commerce/checkout";
import { placeOrderAction, quoteAction, selectRateAction } from "./actions";

// The update-customer → re-quote seam, as a reusable client hook. Owns the quote/rate/pending/error
// state and the debounced re-quote so an address edit always re-prices delivery. Used by the checkout
// form; the same `quoteAction` underneath is reused by the account Addresses editor. Generic → M5.
export function useCheckoutQuote(billing: Address, shipping: Address | undefined) {
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [rate, setRate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Quote (or re-quote) for the current address. Preserves the selected rate if it survives the
  // re-quote (an address change can change the available rates); otherwise picks the first.
  const runQuote = () =>
    startTransition(async () => {
      const res = await quoteAction(billing, shipping);
      if (!res.ok || !res.quote) return setError(res.error ?? "Couldn't calculate delivery.");
      setError(null);
      setQuote(res.quote);
      const chosen = res.quote.rates.find((r) => r.rateId === rate) ?? res.quote.rates[0];
      if (!chosen) return setRate("");
      setRate(chosen.rateId);
      if (!chosen.selected) {
        const sel = await selectRateAction(chosen.rateId);
        if (sel.ok && sel.quote) setQuote(sel.quote);
      }
    });

  const getQuote = () => {
    const miss = firstMissingAddress(billing, true) ?? (shipping ? firstMissingAddress(shipping, false) : null);
    if (miss) return setError(miss);
    setError(null);
    runQuote();
  };

  const chooseRate = (id: string) => {
    setRate(id);
    startTransition(async () => {
      const res = await selectRateAction(id);
      if (res.ok && res.quote) setQuote(res.quote);
      else setError(res.error ?? "Couldn't select that delivery option.");
    });
  };

  // Re-quote when a shipping-determining field (postcode/city/country) changes AFTER the first quote.
  // Debounced; `pending` disables the rate fieldset while it runs. Only the shipped-to address matters.
  const shipAddr = shipping ?? billing;
  const requoteKey = `${shipping ? "S" : "B"}|${shippingKey(shipAddr)}`;
  const lastKey = useRef<string | null>(null);
  useEffect(() => {
    if (!quote) {
      lastKey.current = requoteKey; // baseline: the address that produced the first quote
      return;
    }
    if (lastKey.current === requoteKey) return;
    const id = setTimeout(() => {
      lastKey.current = requoteKey;
      runQuote();
    }, 600);
    return () => clearTimeout(id);
    // runQuote reads the latest state at call time; re-run only when the address key or quote changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requoteKey, quote]);

  return { quote, rate, error, pending, setError, getQuote, chooseRate, runQuote };
}

type PlaceOrderInput = Parameters<typeof placeOrderAction>[0];

// Order placement seam — keeps the async/navigation branches out of the form component. On success
// it refreshes the header cart and routes to the confirmation page; on failure it surfaces the error.
export function usePlaceOrder(setError: (m: string | null) => void) {
  const router = useRouter();
  const [placing, start] = useTransition();
  const place = (input: PlaceOrderInput) =>
    start(async () => {
      const res = await placeOrderAction(input);
      if (res.ok) {
        window.dispatchEvent(new Event("cart:changed"));
        router.push("/checkout/confirmation");
      } else {
        setError(res.error ?? "Couldn't place your order — please try again.");
      }
    });
  return { placing, place };
}
