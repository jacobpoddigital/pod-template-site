"use client";

import { useActionState } from "react";
import { loginAction } from "../_lib/actions";
import type { LoginState } from "@/lib/auth/types";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";

const initial: LoginState = { ok: false };

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} noValidate className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 body-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="username">Username or email</Label>
        <Input id="username" name="username" autoComplete="username" autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
