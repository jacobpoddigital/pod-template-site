"use client";

import { useActionState, useId } from "react";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { subscribe, type NewsletterState } from "./action";

const initial: NewsletterState = { ok: false };

export function NewsletterForm({
  placeholder,
  buttonLabel,
  successMessage,
}: {
  placeholder?: string | null;
  buttonLabel?: string | null;
  successMessage?: string | null;
}) {
  const [state, formAction, pending] = useActionState(subscribe, initial);
  const id = useId();
  const errorId = `${id}-error`;

  if (state.ok) {
    return (
      <p role="status" className="body-lg text-ink">
        {successMessage || "Thanks — you're subscribed."}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <Label htmlFor={id} className="sr-only">
          Email address
        </Label>
        <Input
          id={id}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={placeholder || "you@company.com"}
          aria-describedby={state.error ? errorId : undefined}
          aria-invalid={state.error ? true : undefined}
        />
        {state.error ? (
          <p id={errorId} className="mt-1.5 body-sm text-destructive">
            {state.error}
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Subscribing…" : buttonLabel || "Subscribe"}
      </Button>
    </form>
  );
}
