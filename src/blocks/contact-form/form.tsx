"use client";

import { type ReactNode, useActionState, useEffect, useRef } from "react";
import { submitContact, type ContactState } from "./action";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/ui/select";

const initial: ContactState = { ok: false };

const NETWORK_FAILED = "We couldn't reach the server. Check your connection and try again.";

// Wrap the Server Action so a genuine NETWORK failure (offline / request never reaches the
// server, so the action can't return) becomes a retryable form-level error instead of an
// unhandled rejection that trips the error boundary and loses the visitor's input.
async function submitWithNetworkGuard(prev: ContactState, formData: FormData): Promise<ContactState> {
  try {
    return await submitContact(prev, formData);
  } catch {
    return { ok: false, formError: NETWORK_FAILED };
  }
}

function ErrorText({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-1 body-sm text-destructive">
      {msg}
    </p>
  );
}

type ControlProps = { id: string; "aria-invalid": boolean; "aria-describedby"?: string };

// Label + control + inline error, wired together (htmlFor / aria-invalid / aria-describedby) so
// every field is consistently accessible without repeating the plumbing per field.
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": error ? `${id}-err` : undefined })}
      <ErrorText id={`${id}-err`} msg={error} />
    </div>
  );
}

export function ContactForm({ submitLabel, successMessage }: { submitLabel: string; successMessage: string }) {
  const [state, action, pending] = useActionState(submitWithNetworkGuard, initial);
  const e = state.errors ?? {};
  const startedRef = useRef<HTMLInputElement>(null); // spam time-trap stamp
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  // Move focus to where the problem (or confirmation) is, so keyboard + screen-reader users
  // aren't left on the submit button: success → the status; a form-level error → the alert;
  // field errors → the first invalid control.
  useEffect(() => {
    if (state.ok) {
      successRef.current?.focus();
    } else if (state.formError) {
      alertRef.current?.focus();
    } else if (Object.keys(state.errors ?? {}).length > 0) {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }
  }, [state]);

  if (state.ok) {
    return (
      <p ref={successRef} tabIndex={-1} role="status" className="rounded-card bg-primary/10 px-4 py-3 text-ink">
        {successMessage}
      </p>
    );
  }

  return (
    <form ref={formRef} action={action} noValidate className="space-y-5">
      {state.formError && (
        <p
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="rounded-card bg-destructive/10 px-4 py-3 body-sm text-destructive"
        >
          {state.formError}
        </p>
      )}

      {/* Spam guards (account-free) — not real fields. Honeypot is hidden from humans +
          assistive tech; bots fill it. form_started powers the min-time-to-submit trap. */}
      <div aria-hidden className="sr-only">
        <label>
          Company URL (leave blank)
          <input type="text" name="company_url" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input ref={startedRef} type="hidden" name="form_started" defaultValue="" />

      <Field id="name" label="Name" error={e.name}>
        {(a) => <Input name="name" autoComplete="name" {...a} />}
      </Field>
      <Field id="email" label="Email" error={e.email}>
        {(a) => <Input name="email" type="email" autoComplete="email" {...a} />}
      </Field>
      <Field id="enquiry" label="Topic" error={e.enquiry}>
        {(a) => (
          <Select name="enquiry">
            <SelectTrigger {...a} className="w-full">
              <SelectValue placeholder="Choose a topic…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General enquiry</SelectItem>
              <SelectItem value="quote">Request a quote</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
        )}
      </Field>
      <Field id="message" label="Message" error={e.message}>
        {(a) => <Textarea name="message" rows={5} {...a} />}
      </Field>

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
