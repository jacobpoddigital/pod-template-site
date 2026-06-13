"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContact, type ContactState } from "./action";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui/select";

const initial: ContactState = { ok: false };

function ErrorText({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-1 body-sm text-destructive">
      {msg}
    </p>
  );
}

export function ContactForm({ submitLabel, successMessage }: { submitLabel: string; successMessage: string }) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const e = state.errors ?? {};
  // Spam time-trap: stamp the mount time so the action can reject sub-1.5s (bot) submits.
  const startedRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  if (state.ok) {
    return (
      <p role="status" className="rounded-card bg-primary/10 px-4 py-3 text-ink">
        {successMessage}
      </p>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">
      {/* Spam guards (account-free) — not real fields. Honeypot is hidden from humans +
          assistive tech; bots fill it. form_started powers the min-time-to-submit trap. */}
      <div aria-hidden className="sr-only">
        <label>
          Company URL (leave blank)
          <input type="text" name="company_url" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input ref={startedRef} type="hidden" name="form_started" defaultValue="" />

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" aria-invalid={!!e.name} aria-describedby={e.name ? "name-err" : undefined} />
        <ErrorText id="name-err" msg={e.name} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!e.email} aria-describedby={e.email ? "email-err" : undefined} />
        <ErrorText id="email-err" msg={e.email} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="enquiry">Topic</Label>
        <Select name="enquiry">
          <SelectTrigger id="enquiry" aria-invalid={!!e.enquiry} aria-describedby={e.enquiry ? "enquiry-err" : undefined} className="w-full">
            <SelectValue placeholder="Choose a topic…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General enquiry</SelectItem>
            <SelectItem value="quote">Request a quote</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
        <ErrorText id="enquiry-err" msg={e.enquiry} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} aria-invalid={!!e.message} aria-describedby={e.message ? "message-err" : undefined} />
        <ErrorText id="message-err" msg={e.message} />
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id="consent" name="consent" aria-describedby={e.consent ? "consent-err" : undefined} />
        <div>
          <Label htmlFor="consent" className="body-sm font-normal leading-snug text-ink-muted">
            I agree to be contacted about my enquiry.
          </Label>
          <ErrorText id="consent-err" msg={e.consent} />
        </div>
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
