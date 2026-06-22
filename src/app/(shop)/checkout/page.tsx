import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/ui/section";
import { getCart } from "@/lib/commerce/cart";
import { CHECKOUT_ENABLED, PAYMENT_METHODS } from "@/lib/commerce/config";
import { CheckoutForm } from "./_components/checkout-form";

// Checkout = per-user + mutable + money path → never cached (ADR 0017; workflow/14). When the flow is
// disabled, or the bag is empty, fall back to the cart.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  if (!CHECKOUT_ENABLED) redirect("/cart");
  const cart = await getCart();
  if (cart.isEmpty) redirect("/cart");

  return (
    <Section dataBlock="checkout" padding="default" container="default">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 body-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to cart
      </Link>
      <h1 className="mt-4 display-md text-foreground">Checkout</h1>
      <CheckoutForm cart={cart} paymentMethods={PAYMENT_METHODS} />
    </Section>
  );
}
