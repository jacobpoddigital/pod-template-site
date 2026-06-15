"use client";

import { useActionState } from "react";
import { sendResetAction } from "../_lib/actions";
import type { ResetState } from "@/lib/auth/types";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";

const initial: ResetState = { ok: false };

export function ForgotForm() {
  const [state, action, pending] = useActionState(sendResetAction, initial);

  // Generic confirmation either way — never reveal whether the account exists.
  if (state.done) {
    return (
      <p role="status" className="rounded-md bg-primary/10 px-3 py-2 body-sm text-ink">
        If an account matches that username or email, we’ve sent a link to reset your password.
        Check your inbox.
      </p>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">
      {state.error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 body-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="username">Username or email</Label>
        <Input id="username" name="username" autoComplete="username" autoFocus />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
