"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { saveDetailsAction, changePasswordAction } from "../_lib/actions";

function Notice({ done, error, okText }: { done: boolean; error: string | null; okText: string }) {
  if (done) {
    return (
      <p role="status" className="flex items-center gap-2 rounded-md border border-success/40 bg-success/5 p-3 body-sm text-success">
        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" /> {okText}
      </p>
    );
  }
  if (error) {
    return (
      <p role="alert" className="flex items-start gap-2 rounded-md border border-error/40 bg-error/5 p-3 body-sm text-error">
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> <span>{error}</span>
      </p>
    );
  }
  return null;
}

function DetailsForm({ initial }: { initial: { firstName: string; lastName: string; email: string } }) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [email, setEmail] = useState(initial.email);
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      setError(null);
      setDone(false);
      const res = await saveDetailsAction({ firstName, lastName, email });
      if (res.ok) setDone(true);
      else setError(res.error ?? "Couldn't update your details.");
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
      </div>
      <Notice done={done} error={error} okText="Your details have been saved." />
      <Button type="submit" size="md" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}

function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      setError(null);
      setDone(false);
      const res = await changePasswordAction({ password, confirm });
      if (res.ok) {
        setDone(true);
        setPassword("");
        setConfirm("");
      } else {
        setError(res.error ?? "Couldn't change your password.");
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5" />
        </div>
      </div>
      <Notice done={done} error={error} okText="Your password has been changed." />
      <Button type="submit" size="md" disabled={pending}>{pending ? "Updating…" : "Change password"}</Button>
    </form>
  );
}

export function DetailsForms({ initial }: { initial: { firstName: string; lastName: string; email: string } }) {
  return (
    <div className="space-y-10">
      <section aria-labelledby="details-h">
        <h3 id="details-h" className="body font-semibold text-foreground">Your details</h3>
        <div className="mt-4">
          <DetailsForm initial={initial} />
        </div>
      </section>
      <section aria-labelledby="pw-h" className="border-t border-border pt-8">
        <h3 id="pw-h" className="body font-semibold text-foreground">Change password</h3>
        <p className="mt-1 body-sm text-muted-foreground">Use at least 8 characters. You’ll stay signed in.</p>
        <div className="mt-4">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
