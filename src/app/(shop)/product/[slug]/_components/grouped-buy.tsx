"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Footprints } from "lucide-react";
import { Button } from "@/ui/button";
import { addToCartAction } from "@/app/(shop)/cart/_lib/actions";
import { Price, StockNote } from "@/app/(shop)/_components/price";
import type { ProductCard } from "@/lib/commerce/products";

// One row of a grouped product: a child product added to the cart on its own. Simple + in-stock
// children get a direct "Add" (no options); variable or out-of-stock children link to their own PDP
// (you can't add a variable product without picking a variation).
function ChildRow({ child }: { child: ProductCard }) {
  const [note, setNote] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const href = `/product/${child.slug}`;
  const directAdd = child.kind === "simple" && child.inStock;

  const add = () => {
    setNote(null);
    setAdded(false);
    startTransition(async () => {
      const res = await addToCartAction(child.id, 1);
      if (!res.ok) return setNote(res.error ?? "Couldn't add to bag.");
      setAdded(true);
      window.dispatchEvent(new Event("cart:changed"));
      window.dispatchEvent(new Event("cart:open"));
    });
  };

  return (
    <li className="flex items-center gap-4 border-b border-border py-4 last:border-b-0">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted">
        {child.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={child.image.url} alt="" className="h-full w-full object-contain" />
        ) : (
          <Footprints className="size-7 text-muted-foreground/40" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="body font-medium text-foreground">
          <Link href={href} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:text-link">
            {child.name}
          </Link>
        </h3>
        <Price product={child} className="mt-0.5" />
        <StockNote state={child.stockStatus} qty={child.stockQuantity} backorder={child.backorders} className="mt-0.5" />
        {added && <p className="mt-1 body-sm text-foreground" aria-live="polite">Added to bag.</p>}
        {note && <p className="mt-1 body-sm text-error" aria-live="polite">{note}</p>}
      </div>
      {directAdd ? (
        <Button type="button" size="md" disabled={isPending} onClick={add} className="shrink-0">
          {isPending ? "Adding…" : "Add"}
        </Button>
      ) : (
        <Button asChild size="md" variant="secondary" className="shrink-0">
          <Link href={href}>View</Link>
        </Button>
      )}
    </li>
  );
}

export function GroupedBuy({ products }: { products: ProductCard[] }) {
  if (products.length === 0) {
    return <p className="mt-4 body-sm text-muted-foreground">This bundle has no items yet.</p>;
  }
  return (
    <div className="mt-4">
      <h2 className="display-xs text-foreground">What&apos;s included</h2>
      <ul className="mt-2">
        {products.map((child) => (
          <ChildRow key={child.id} child={child} />
        ))}
      </ul>
    </div>
  );
}
