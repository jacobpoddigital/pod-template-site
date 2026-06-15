import Link from "next/link";
import { Section } from "@/ui/section";
import { Card, CardContent } from "@/ui/card";

// Shared centred card for the auth routes (login / forgot / reset). Keeps the three
// screens visually consistent; no auth logic here. Auth scaffolding — docs/auth.md.

export function AuthShell({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Section dataBlock="auth" padding="hero" container="narrow">
      <div className="mx-auto max-w-md">
        <h1 className="display-sm text-ink">{title}</h1>
        {intro ? <p className="mt-2 body text-ink-muted">{intro}</p> : null}
        <Card className="mt-6">
          <CardContent className="p-6">{children}</CardContent>
        </Card>
        {footer ? <div className="mt-4 body-sm text-ink-muted">{footer}</div> : null}
      </div>
    </Section>
  );
}

/** A muted text link used in the auth-card footers. */
export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}
