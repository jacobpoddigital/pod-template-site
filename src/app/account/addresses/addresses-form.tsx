"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/ui/button";
import { AddressForm } from "@/app/(shop)/_components/address-form";
import type { Address } from "@/lib/commerce/checkout";
import { saveAddressesAction } from "../_lib/actions";

// Billing + shipping editor — reuses the shared checkout AddressForm and saves via saveAddressesAction
// (which also re-quotes an active cart, sharing the checkout update-customer → re-quote helper).
export function AddressesForm({ billing: initialBilling, shipping: initialShipping }: {
  billing: Address;
  shipping: Address;
}) {
  const [billing, setBilling] = useState<Address>(initialBilling);
  const [shipping, setShipping] = useState<Address>(initialShipping);
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onBilling = (k: keyof Address, v: string) => setBilling((a) => ({ ...a, [k]: v }));
  const onShipping = (k: keyof Address, v: string) => setShipping((a) => ({ ...a, [k]: v }));
  const copyBilling = () => setShipping({ ...billing, email: "" });

  const save = () =>
    start(async () => {
      setError(null);
      setDone(false);
      const res = await saveAddressesAction(billing, shipping);
      if (res.ok) setDone(true);
      else setError(res.error ?? "Couldn't save your addresses.");
    });

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <section aria-labelledby="bill-h">
        <h3 id="bill-h" className="body font-semibold text-foreground">Billing address</h3>
        <div className="mt-4">
          <AddressForm idPrefix="acc-bill" address={billing} onChange={onBilling} showEmail />
        </div>
      </section>

      <section aria-labelledby="ship-h">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="ship-h" className="body font-semibold text-foreground">Shipping address</h3>
          <button type="button" onClick={copyBilling} className="body-sm font-medium text-link hover:underline">
            Same as billing
          </button>
        </div>
        <div className="mt-4">
          <AddressForm idPrefix="acc-ship" address={shipping} onChange={onShipping} showEmail={false} />
        </div>
      </section>

      {done ? (
        <p role="status" className="flex items-center gap-2 rounded-md border border-success/40 bg-success/5 p-3 body-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" /> Your addresses have been saved.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-error/40 bg-error/5 p-3 body-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> <span>{error}</span>
        </p>
      ) : null}

      <Button type="submit" size="md" disabled={pending}>
        {pending ? "Saving…" : "Save addresses"}
      </Button>
    </form>
  );
}
