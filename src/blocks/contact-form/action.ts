"use server";

import { z } from "zod";

// Server-side validation (docs/standards.md §5: Zod on the server is security, not just UX).
const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  enquiry: z.string().min(1, "Please choose a topic."),
  message: z.string().trim().min(10, "Please add a little more detail (10+ characters)."),
});

export type ContactState = { ok: boolean; errors?: Record<string, string> };

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
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
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // TODO per client: deliver the enquiry (email / CRM / WP). Stubbed to success for the starter.
  return { ok: true };
}
