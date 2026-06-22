"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tag, X } from "lucide-react";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import type { CartCoupon } from "@/lib/commerce/cart";
import { applyCouponAction, removeCouponAction } from "@/app/(shop)/cart/_lib/actions";

// Discount-code field — applied coupons (with remove) + an input. Coupons live on the Store-API cart
// session, so a code applied here carries through to checkout automatically. Refreshes the route
// after a change so the server-rendered totals (discount line) update.
export function CouponField({ coupons, onChanged }: { coupons: CartCoupon[]; onChanged?: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const settle = () => {
    router.refresh(); // update server-rendered totals (cart prop / summary lines)
    onChanged?.(); // checkout: re-quote so the live total reflects the discount
  };

  const apply = () =>
    startTransition(async () => {
      const res = await applyCouponAction(code);
      if (res.ok) {
        setCode("");
        setError(null);
        settle();
      } else {
        setError(res.error ?? "That code can't be applied.");
      }
    });

  const remove = (c: string) =>
    startTransition(async () => {
      const res = await removeCouponAction(c);
      if (res.ok) settle();
      else setError(res.error ?? null);
    });

  return (
    <div>
      {coupons.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {coupons.map((c) => (
            <li key={c.code} className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-raised px-3 py-2 body-sm">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Tag className="size-3.5 text-success" aria-hidden="true" /> {c.code}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-success">−{c.discount}</span>
                <button
                  type="button"
                  onClick={() => remove(c.code)}
                  disabled={pending}
                  aria-label={`Remove discount code ${c.code}`}
                  className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
          placeholder="Discount code"
          aria-label="Discount code"
          className="flex-1"
        />
        <Button type="button" variant="secondary" size="md" onClick={apply} disabled={pending || !code.trim()}>
          {pending ? "Applying…" : "Apply"}
        </Button>
      </div>
      {error && <p role="alert" className="mt-2 body-sm text-error">{error}</p>}
    </div>
  );
}
