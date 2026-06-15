import type { Metadata } from "next";
import { AuthShell, AuthLink } from "../_components/auth-shell";
import { ResetForm } from "./reset-form";

// /reset-password?key=…&login=… — the target of WP's reset email. Completes the reset via
// core resetUserPassword, then sends the user to /login?reset=1. docs/auth.md.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ key?: string; login?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { key, login } = await searchParams;

  // A reset link without its key/login is malformed (or the user navigated here directly).
  if (!key || !login) {
    return (
      <AuthShell title="Invalid reset link" footer={<AuthLink href="/forgot-password">Request a new link</AuthLink>}>
        <p className="body-sm text-ink-muted">
          This password-reset link is missing information or has already been used. Request a fresh one.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" intro="Choose a new password for your account.">
      <ResetForm resetKey={key} login={login} />
    </AuthShell>
  );
}
