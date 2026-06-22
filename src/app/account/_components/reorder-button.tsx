"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/ui/button";
import { reorderAction } from "../_lib/actions";

// Adds a past order's items back to the cart, then opens the mini-cart drawer (cart:open) and
// refreshes the header badge (cart:changed) — mirrors the PDP add-to-bag handshake. Surfaces a
// short result note (added / some skipped). Generic → template M5.
export function ReorderButton({ orderId }: { orderId: number }) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reorder = () =>
    start(async () => {
      setNote(null);
      setError(null);
      const res = await reorderAction(orderId);
      if (!res.ok) return setError(res.error ?? "Couldn't reorder these items.");
      window.dispatchEvent(new Event("cart:changed"));
      window.dispatchEvent(new Event("cart:open"));
      setNote(res.skipped > 0 ? `Added ${res.added} item${res.added === 1 ? "" : "s"} — ${res.skipped} unavailable and skipped.` : "Added to your bag.");
    });

  return (
    <div>
      <Button type="button" variant="secondary" size="sm" onClick={reorder} disabled={pending}>
        <RotateCcw className="size-4" aria-hidden="true" /> {pending ? "Adding…" : "Buy again"}
      </Button>
      {note ? <p className="mt-2 body-sm text-muted-foreground" role="status">{note}</p> : null}
      {error ? <p className="mt-2 body-sm text-error" role="alert">{error}</p> : null}
    </div>
  );
}
