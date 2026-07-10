// Contact form delivery via Contact Form 7's REST feedback endpoint (agency
// standard, docs/contact-form.md). CF7 already runs the agency's classic-WP sites —
// reusing it headlessly means every enquiry form delivers the same way (mail
// sending, Akismet, spam heuristics) without wiring a new external service per
// client. WP_ORIGIN is derived from WPGRAPHQL_URL (strip the trailing /graphql).
// CF7_FORM_ID is the per-site form's post ID (seeded by wp/seed-contact-form.php).

export interface ContactFields {
  name: string;
  email: string;
  enquiry: string;
  message: string;
}

/** Maps the frontend's short `enquiry` select value to CF7's configured option label.
 *  Extend per client alongside the <Select> options in form.tsx + the CF7 form's
 *  `[select* your-enquiry ...]` tag — the three must stay in sync. */
const ENQUIRY_LABELS: Record<string, string> = {
  general: "General enquiry",
  quote: "Request a quote",
  support: "Support",
};

/** Returns true on confirmed delivery (CF7 reports mail_sent). False for a
 *  missing/misconfigured env (caller decides whether that's fatal) OR a real
 *  send failure — both cases the caller should surface as a retryable error. */
export async function deliverToCf7(fields: ContactFields): Promise<boolean> {
  const graphqlUrl = process.env.WPGRAPHQL_URL;
  const formId = process.env.CF7_FORM_ID;
  if (!graphqlUrl || !formId) return false;
  const wpOrigin = graphqlUrl.replace(/\/graphql\/?$/, "");

  const body = new FormData();
  body.set("your-name", fields.name);
  body.set("your-email", fields.email);
  body.set("your-enquiry", ENQUIRY_LABELS[fields.enquiry] ?? fields.enquiry);
  body.set("your-message", fields.message);
  body.set("_wpcf7", formId);
  body.set("_wpcf7_version", "6.1.6");
  body.set("_wpcf7_locale", "en_US");
  body.set("_wpcf7_unit_tag", `wpcf7-f${formId}-o1`);
  body.set("_wpcf7_container_post", "0");

  const res = await fetch(`${wpOrigin}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`, {
    method: "POST",
    body,
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { status?: string };
  return data.status === "mail_sent";
}
