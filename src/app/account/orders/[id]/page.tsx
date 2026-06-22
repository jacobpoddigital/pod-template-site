import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import type { Address } from "@/lib/commerce/checkout";
import { ACCOUNT_ENABLED } from "@/lib/commerce/config";
import { getCustomerOrder, type OrderDetail } from "@/lib/commerce/customer";
import { OrderStatusBadge } from "../../_components/order-status-badge";
import { ReorderButton } from "../../_components/reorder-button";
import { formatOrderDate } from "../../_lib/format";

export const metadata = { title: "Order" };

function TotalRow({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "border-t border-border pt-2 body font-semibold" : "body-sm"}`}>
      <dt className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={accent ? "text-success" : "text-foreground"}>{value}</dd>
    </div>
  );
}

function AddressBlock({ title, address }: { title: string; address: Address | null }) {
  return (
    <div>
      <h4 className="body-sm font-semibold text-foreground">{title}</h4>
      {address ? (
        <address className="mt-1 not-italic body-sm text-muted-foreground">
          {address.firstName} {address.lastName}
          <br />
          {address.address1}
          {address.address2 ? (<><br />{address.address2}</>) : null}
          <br />
          {address.city}
          {address.postcode ? `, ${address.postcode}` : ""}
          <br />
          {address.country}
        </address>
      ) : (
        <p className="mt-1 body-sm text-muted-foreground">—</p>
      )}
    </div>
  );
}

// A money value Woo didn't apply reads as "£0.00" — hide those rows (discount/tax) to keep the
// summary clean. Extracted so the page component stays under the complexity budget.
const hasValue = (v: string | null) => Boolean(v) && v !== "£0.00";

function OrderTotals({ order }: { order: OrderDetail }) {
  return (
    <aside className="h-fit rounded-lg border border-border bg-surface-muted p-5">
      <h3 className="body font-semibold text-foreground">Order summary</h3>
      <dl className="mt-3 space-y-2">
        {order.subtotal ? <TotalRow label="Subtotal" value={order.subtotal} /> : null}
        {hasValue(order.discountTotal) ? <TotalRow label="Discount" value={`−${order.discountTotal}`} accent /> : null}
        {order.shippingTotal ? <TotalRow label="Delivery" value={order.shippingTotal} /> : null}
        {hasValue(order.totalTax) ? <TotalRow label="Tax" value={order.totalTax!} /> : null}
        <TotalRow label="Total" value={order.total} strong />
      </dl>
    </aside>
  );
}

function Downloads({ order }: { order: OrderDetail }) {
  if (order.downloads.length === 0) return null;
  return (
    <section aria-labelledby="dl-h" className="rounded-lg border border-border bg-surface-raised p-5">
      <h3 id="dl-h" className="body font-semibold text-foreground">Downloads</h3>
      <ul className="mt-3 space-y-2">
        {order.downloads.map((d) => (
          <li key={d.downloadId} className="flex items-center justify-between gap-3">
            <span className="body-sm text-foreground">{d.name}</span>
            {d.url ? (
              <a href={d.url} className="inline-flex items-center gap-1.5 body-sm font-medium text-link hover:underline" rel="nofollow">
                <Download className="size-3.5" aria-hidden="true" /> Download
              </a>
            ) : (
              <span className="body-sm text-muted-foreground">Unavailable</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!ACCOUNT_ENABLED) notFound(); // commerce account module off → not a route on this site
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  const order = await getCustomerOrder(orderId).catch(() => null);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 body-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="display-xs text-foreground">Order #{order.number}</h2>
          <p className="mt-1 body-sm text-muted-foreground">
            Placed {formatOrderDate(order.date)}
            {order.paymentMethodTitle ? ` · ${order.paymentMethodTitle}` : ""}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ReorderButton orderId={order.id} />

      {/* Line items */}
      <section aria-labelledby="items-h" className="rounded-lg border border-border bg-surface-raised">
        <h3 id="items-h" className="sr-only">Items</h3>
        <ul className="divide-y divide-border">
          {order.lines.map((line, i) => (
            <li key={`${line.slug ?? line.name}-${i}`} className="flex items-center gap-4 p-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted">
                {line.image ? (
                  <Image src={line.image.url} alt={line.image.alt} fill sizes="64px" className="object-contain" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                {line.slug ? (
                  <Link href={`/product/${line.slug}`} className="body-sm font-medium text-foreground hover:text-link">{line.name}</Link>
                ) : (
                  <span className="body-sm font-medium text-foreground">{line.name}</span>
                )}
                {line.variation ? <p className="body-sm text-muted-foreground">{line.variation}</p> : null}
                <p className="body-sm text-muted-foreground">Qty {line.quantity}</p>
                {line.purchaseNote ? (
                  <p className="mt-2 rounded-md border border-border bg-surface-muted px-3 py-2 body-sm text-muted-foreground">
                    {line.purchaseNote}
                  </p>
                ) : null}
              </div>
              <span className="body-sm font-semibold text-foreground">{line.total}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_18rem]">
        {/* Addresses */}
        <section aria-labelledby="addr-h" className="rounded-lg border border-border bg-surface-raised p-5">
          <h3 id="addr-h" className="body font-semibold text-foreground">Delivery & billing</h3>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <AddressBlock title="Shipping" address={order.shipping} />
            <AddressBlock title="Billing" address={order.billing} />
          </div>
          {order.customerNote ? (
            <p className="mt-4 border-t border-border pt-3 body-sm text-muted-foreground">
              <span className="font-medium text-foreground">Note:</span> {order.customerNote}
            </p>
          ) : null}
        </section>

        {/* Totals */}
        <OrderTotals order={order} />
      </div>

      <Downloads order={order} />
    </div>
  );
}
