"use server";

import { z } from "zod";

// Server-side validation (docs/standards.md §5: Zod on the server is security, not just UX).
const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  enquiry: z.string().min(1, "Please choose a topic."),
  message: z.string().trim().min(10, "Please add a little more detail (10+ characters)."),
});

// `errors` = per-field messages (validation); `formError` = a form-level failure the user can
// retry (delivery/network) — kept separate so the UI can render a field error inline AND a
// top-of-form alert independently. docs/standards.md §5.
export type ContactState = { ok: boolean; errors?: Record<string, string>; formError?: string };

const DELIVERY_FAILED =
  "Sorry — we couldn't send your message just now. Please try again, or email us directly.";

// Per client, replace this stub with real delivery (CRM HubSpot/Zoho, email, or WP). A thrown
// error here is caught in submitContact and shown as a retryable form-level error — NEVER let it
// bubble to the error boundary (that would discard everything the visitor typed).
async function deliverEnquiry(data: z.infer<typeof enquirySchema>): Promise<void> {
  void data; // TODO per client: await crm.createLead(data) / await sendEmail(data) / etc.
}

// Account-free spam guards (research/2026-06-13-build-gap-analysis §5.1): a honeypot field
// (hidden from humans; bots fill it) + a min-time-to-submit trap. Both "drop silently" —
// return success so a bot gets no signal to adapt — rather than surfacing an error. A
// stronger layer (Cloudflare Turnstile / a rate-limit store) is the per-client upgrade.
function isSpam(formData: FormData): boolean {
  const honeypot = formData.get("company_url"); // the hidden trap field
  if (typeof honeypot === "string" && honeypot.trim() !== "") return true;
  const started = Number(formData.get("form_started"));
  // Submitted < 1.5s after the form mounted = automated. Absent/older (no-JS, clock skew) → allow.
  if (started > 0 && Date.now() - started < 1500) return true;
  return false;
}

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  if (isSpam(formData)) return { ok: true }; // drop silently — don't tip off the bot
  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    enquiry: formData.get("enquiry"),
    message: formData.get("message"),
  });
  const errors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
  }
  if (formData.get("consent") !== "on") errors.consent = "Please agree to be contacted.";
  if (!parsed.success || Object.keys(errors).length > 0) return { ok: false, errors };

  // parsed.success is narrowed true here → parsed.data is the validated payload.
  try {
    await deliverEnquiry(parsed.data);
  } catch {
    return { ok: false, formError: DELIVERY_FAILED }; // retryable — the visitor keeps their input
  }
  return { ok: true };
}
