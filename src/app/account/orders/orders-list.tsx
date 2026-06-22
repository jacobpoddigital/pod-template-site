"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/ui/button";
import type { OrderCard } from "@/lib/commerce/customer";
import { OrderStatusBadge } from "../_components/order-status-badge";
import { ReorderButton } from "../_components/reorder-button";
import { formatOrderDate } from "../_lib/format";

function OrderRow({ order }: { order: OrderCard }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface-raised p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="body font-semibold text-foreground">Order #{order.number}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 body-sm text-muted-foreground">
          {formatOrderDate(order.date)} · {order.total}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Link href={`/account/orders/${order.id}`} className="inline-flex items-center gap-1 body-sm font-medium text-link hover:underline">
          View order <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
        <ReorderButton orderId={order.id} />
      </div>
    </li>
  );
}

// Order history list with cursor-backed "Load more" (appends; account is noindex so no crawlable
// page URLs needed). Initial page is SSR'd; further pages come from /api/account/orders.
export function OrdersList({ initial, initialHasNext, initialCursor }: {
  initial: OrderCard[];
  initialHasNext: boolean;
  initialCursor: string | null;
}) {
  const [orders, setOrders] = useState<OrderCard[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const loadMore = () =>
    start(async () => {
      setError(null);
      const res = await fetch(`/api/account/orders?after=${encodeURIComponent(cursor ?? "")}`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as { orders?: OrderCard[]; hasNextPage?: boolean; endCursor?: string | null } | null;
      if (!res.ok || !data?.orders) return setError("Couldn't load more orders — please try again.");
      setOrders((prev) => [...prev, ...data.orders!]);
      setHasNext(Boolean(data.hasNextPage));
      setCursor(data.endCursor ?? null);
    });

  return (
    <div>
      <ul className="space-y-3">
        {orders.map((o) => (
          <OrderRow key={o.id} order={o} />
        ))}
      </ul>
      {error ? <p className="mt-3 body-sm text-error" role="alert">{error}</p> : null}
      {hasNext ? (
        <div className="mt-5 text-center">
          <Button type="button" variant="outline" size="md" onClick={loadMore} disabled={pending}>
            {pending ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
