import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../_lib/session";
import { AFTER_LOGIN_PATH, useAuthMock } from "@/lib/auth/config";
import { AuthShell, AuthLink } from "../_components/auth-shell";
import { LoginForm } from "./login-form";

// /login — credentials → JWT (server-side), tokens land in httpOnly cookies. Dynamic
// (reads cookies). Already-authenticated users skip to the account area. docs/auth.md.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false }, // auth screens are never indexed
};

interface Props {
  searchParams: Promise<{ next?: string; reset?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, reset } = await searchParams;
  if (await getSession()) redirect(next && next.startsWith("/") ? next : AFTER_LOGIN_PATH);

  return (
    <AuthShell
      title="Sign in"
      intro="Access your account area."
      footer={<AuthLink href="/forgot-password">Forgotten your password?</AuthLink>}
    >
      {reset ? (
        <p role="status" className="mb-4 rounded-md bg-primary/10 px-3 py-2 body-sm text-ink">
          Your password has been updated. Sign in with your new password.
        </p>
      ) : null}
      {useAuthMock ? (
        <p className="mb-4 rounded-md bg-muted px-3 py-2 body-sm text-ink-muted">
          <strong>Dev mode:</strong> sign in with <code>member@example.com</code> / <code>password</code>.
        </p>
      ) : null}
      <LoginForm next={next} />
    </AuthShell>
  );
}
