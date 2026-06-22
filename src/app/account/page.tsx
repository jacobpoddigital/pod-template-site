import type { Metadata } from "next";
import Link from "next/link";
import { Package, MapPin, UserCog, Download, ArrowRight } from "lucide-react";
import { Section } from "@/ui/section";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { ACCOUNT_ENABLED } from "@/lib/commerce/config";
import { getAccountSummary } from "@/lib/commerce/customer";
import { getSession } from "../(auth)/_lib/session";
import { logoutAction } from "../(auth)/_lib/actions";
import { OrderStatusBadge } from "./_components/order-status-badge";
import { ReorderButton } from "./_components/reorder-button";
import { formatOrderDate } from "./_lib/format";

// /account — gated member area shared by two opt-in modules. With commerce account OFF (default)
// this is the AUTH worked-example (identity + sign-out — the "case study of auth", docs/auth.md).
// With the commerce module ON (ACCOUNT_ENABLED) it's the storefront customer dashboard; the layout
// supplies the shell + section nav and this renders the matching body. docs/commerce.md.
export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

// --- Auth module worked-example (commerce account OFF) -----------------------------------------
async function AuthAccountExample() {
  const user = await getSession(); // guaranteed non-null by the layout guard
  return (
    <Section dataBlock="account" padding="default" container="narrow">
      <h1 className="display-md text-ink">Your account</h1>
      <p className="mt-2 body text-ink-muted">
        You’re signed in. This is the gated area — swap this for real member content (or enable the
        commerce account module for a full orders/addresses portal).
      </p>

      <Card className="mt-6">
        <CardContent className="space-y-2 p-6">
          <p className="body text-ink">
            <span className="text-ink-muted">Name:</span> {user?.name}
          </p>
          {user?.email ? (
            <p className="body text-ink">
              <span className="text-ink-muted">Email:</span> {user.email}
            </p>
          ) : null}
          <p className="body-sm text-ink-muted">
            Capabilities: {user?.capabilities.length ? user.capabilities.join(", ") : "—"}
          </p>
        </CardContent>
      </Card>

      <form action={logoutAction} className="mt-6">
        <Button type="submit" variant="secondary">Sign out</Button>
      </form>
    </Section>
  );
}

// --- Commerce storefront dashboard (commerce account ON) ---------------------------------------
const QUICK_LINKS = [
  { href: "/account/orders", label: "Orders", desc: "Track and review past orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", desc: "Billing & delivery details", icon: MapPin },
  { href: "/account/details", label: "Account details", desc: "Name, email & password", icon: UserCog },
  { href: "/account/downloads", label: "Downloads", desc: "Your digital products", icon: Download },
];

function orderCountLine(count: number | undefined): string {
  if (!count) return "Welcome to your account.";
  return `You've placed ${count} order${count === 1 ? "" : "s"} with us.`;
}

async function CommerceDashboard() {
  // Fall back to the session name if the Woo customer read fails, so the page never dead-ends.
  const [summary, session] = await Promise.all([getAccountSummary().catch(() => null), getSession()]);
  const firstName = summary?.firstName || session?.name?.split(/\s+/)[0] || "there";
  const last = summary?.lastOrder ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="display-xs text-foreground">Hello, {firstName}</h2>
        <p className="mt-1 body-sm text-muted-foreground">{orderCountLine(summary?.orderCount)}</p>
      </div>

      {/* Most-recent order */}
      {last ? (
        <section aria-labelledby="recent-h" className="rounded-lg border border-border bg-surface-raised p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 id="recent-h" className="body font-semibold text-foreground">Most recent order</h3>
              <p className="mt-0.5 body-sm text-muted-foreground">
                #{last.number} · {formatOrderDate(last.date)} · {last.total}
              </p>
            </div>
            <OrderStatusBadge status={last.status} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href={`/account/orders/${last.id}`} className="inline-flex items-center gap-1 body-sm font-medium text-link hover:underline">
              View order <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <ReorderButton orderId={last.id} />
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-surface-muted p-5">
          <p className="body-sm text-muted-foreground">No orders yet. When you place one it’ll show up here.</p>
          <Link href="/shop" className="mt-2 inline-flex items-center gap-1 body-sm font-medium text-link hover:underline">
            Start shopping <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </section>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-3 rounded-lg border border-border bg-surface-raised p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block body-sm font-semibold text-foreground">{label}</span>
              <span className="mt-0.5 block body-sm text-muted-foreground">{desc}</span>
            </span>
            <ArrowRight className="ml-auto size-4 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function AccountPage() {
  return ACCOUNT_ENABLED ? <CommerceDashboard /> : <AuthAccountExample />;
}
