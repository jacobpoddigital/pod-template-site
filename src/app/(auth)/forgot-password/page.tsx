import type { Metadata } from "next";
import { AuthShell, AuthLink } from "../_components/auth-shell";
import { ForgotForm } from "./forgot-form";

// /forgot-password — triggers WP's reset email (core sendPasswordResetEmail). docs/auth.md.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      intro="Enter your username or email and we’ll send you a link to set a new password."
      footer={<AuthLink href="/login">Back to sign in</AuthLink>}
    >
      <ForgotForm />
    </AuthShell>
  );
}
