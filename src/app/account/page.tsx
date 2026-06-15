import type { Metadata } from "next";
import { Section } from "@/ui/section";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { getSession } from "../(auth)/_lib/session";
import { logoutAction } from "../(auth)/_lib/actions";

// /account — the WORKED EXAMPLE of a gated route (the "case study of auth"). The layout
// guard guarantees a user here; this just renders their identity + a sign-out. Replace the
// body with real member content (orders, downloads, a portal) per client. docs/auth.md.
export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getSession(); // guaranteed non-null by the layout guard

  return (
    <Section dataBlock="account" padding="default" container="narrow">
      <h1 className="display-md text-ink">Your account</h1>
      <p className="mt-2 body text-ink-muted">
        You’re signed in. This is the gated area — swap this for real member content.
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
