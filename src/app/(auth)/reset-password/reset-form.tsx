"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "../_lib/actions";
import type { ResetState } from "@/lib/auth/types";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";

const initial: ResetState = { ok: false };

// `key` + `login` arrive in the reset-link query string (WP emails the URL). They ride
// as hidden fields; the action completes the reset, then redirects to /login?reset=1.
export function ResetForm({ resetKey, login }: { resetKey: string; login: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="key" value={resetKey} />
      <input type="hidden" name="login" value={login} />

      {state.error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 body-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Updating…" : "Set new password"}
      </Button>
    </form>
  );
}
