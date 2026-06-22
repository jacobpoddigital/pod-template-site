import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Section } from "@/ui/section";
import { ButtonLink } from "@/ui/button-link";
import { getLastOrder } from "@/lib/commerce/checkout";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order received", robots: { index: false } };

export default async function ConfirmationPage() {
  const order = await getLastOrder();
  if (!order) redirect("/shop"); // no recent order in this session

  return (
    <Section dataBlock="checkout-confirmation" padding="default" container="narrow">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
        <h1 className="mt-4 display-md text-foreground">Order received</h1>
        <p className="mt-3 body text-muted-foreground">
          Thank you — your order <span className="font-semibold text-foreground">#{order.orderId}</span> has been placed.
        </p>
      </div>

      <dl className="mx-auto mt-8 max-w-md space-y-3 rounded-lg border border-border bg-surface-muted p-6">
        <div className="flex justify-between body-sm">
          <dt className="text-muted-foreground">Order number</dt>
          <dd className="font-medium text-foreground">#{order.orderId}</dd>
        </div>
        <div className="flex justify-between body-sm">
          <dt className="text-muted-foreground">Items</dt>
          <dd className="font-medium text-foreground">{order.itemCount}</dd>
        </div>
        <div className="flex justify-between body-sm">
          <dt className="text-muted-foreground">Total</dt>
          <dd className="font-medium text-foreground">{order.total}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 body-sm">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-medium text-foreground capitalize">{order.status.replace(/-/g, " ")}</dd>
        </div>
        {order.email && (
          <p className="border-t border-border pt-3 body-sm text-muted-foreground">
            A confirmation has been sent to <span className="text-foreground">{order.email}</span>.
          </p>
        )}
      </dl>

      <p className="mx-auto mt-6 max-w-md text-center body-sm text-muted-foreground">
        This is a test order placed with the Cheque (offline) gateway — no payment was taken.
      </p>

      <div className="mt-8 flex justify-center">
        <ButtonLink href="/shop">Continue shopping</ButtonLink>
      </div>
    </Section>
  );
}
