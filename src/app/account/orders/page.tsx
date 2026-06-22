import { Package } from "lucide-react";
import { notFound } from "next/navigation";
import { ACCOUNT_ENABLED } from "@/lib/commerce/config";
import { getCustomerOrders } from "@/lib/commerce/customer";
import { EmptyState } from "../_components/empty-state";
import { OrdersList } from "./orders-list";

// /account/orders — full order history (cursor-paginated, "Load more"). Personalised + noindex.
export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  if (!ACCOUNT_ENABLED) notFound(); // commerce account module off → not a route on this site
  const { orders, hasNextPage, endCursor } = await getCustomerOrders(20).catch(() => ({
    orders: [],
    hasNextPage: false,
    endCursor: null,
  }));

  return (
    <div className="space-y-5">
      <h2 className="display-xs text-foreground">Orders</h2>
      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="size-8" aria-hidden="true" />}
          title="No orders yet"
          body="When you place an order it’ll appear here, ready to track or reorder."
          cta={{ href: "/shop", label: "Start shopping" }}
        />
      ) : (
        <OrdersList initial={orders} initialHasNext={hasNextPage} initialCursor={endCursor} />
      )}
    </div>
  );
}
