import type { Metadata } from "next";
import { Section } from "@/ui/section";
import { ACCOUNT_ENABLED } from "@/lib/commerce/config";
import { requireUser } from "../(auth)/_lib/guard";
import { AccountNav } from "./_components/account-nav";

// Gates EVERY /account/* route server-side (the real check; middleware is just a fast redirect).
// Unauthenticated → /login?next=/account. Two opt-in modules share this path:
//   • commerce account OFF (default) → the AUTH worked-example renders plainly (docs/auth.md).
//   • commerce account ON (ACCOUNT_ENABLED) → wrap children in the storefront account shell
//     (section nav + content) — orders/addresses/details/downloads (docs/commerce.md).
// Personalised → force-dynamic + noindex either way.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/account");
  if (!ACCOUNT_ENABLED) return <>{children}</>;
  return (
    <Section dataBlock="account" padding="default">
      <h1 className="display-sm text-foreground">Your account</h1>
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </Section>
  );
}
