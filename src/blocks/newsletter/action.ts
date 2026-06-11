"use server";

import { z } from "zod";

// Server-side validation (docs/standards.md §5: Zod on the server is security, not just UX).
const subscribeSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export type NewsletterState = { ok: boolean; error?: string };

export async function subscribe(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = subscribeSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }
  // TODO per client: deliver to the ESP (Mailchimp / Klaviyo / WP). Stubbed to success.
  return { ok: true };
}
