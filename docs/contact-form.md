# Contact form delivery (headless)

Agency standard: enquiry forms deliver via **Contact Form 7's REST feedback endpoint** —
the same plugin every classic-WP agency site already runs, reused headlessly. No new
external service (email provider, CRM API key) needed per client.

## How it works

- `src/lib/contact-delivery.ts` — `deliverToCf7()`, shared by both contact-form blocks.
  POSTs to `${WP_ORIGIN}/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}/feedback`
  as `multipart/form-data`. `WP_ORIGIN` is derived from `WPGRAPHQL_URL` (strip `/graphql`).
- `wp/seed-contact-form.php` — creates/updates the CF7 form (`wp eval-file`, idempotent).
  Field names (`your-name`/`your-email`/`your-enquiry`/`your-message`) must match the
  frontend's `<Select>` options in `form.tsx` 1:1 — extend both together.
- `CF7_FORM_ID` — the form's post ID, set per environment in `backend.config.json`
  (`cf7FormId`, local/dev) and as a Vercel env var (prod/preview) — non-secret, just a
  post ID.

## Per-client setup

1. Install + activate `contact-form-7` on the client's WP install.
2. `wp eval-file wp/seed-contact-form.php` — creates the form, prints its ID.
3. Set `CF7_FORM_ID` in `backend.config.json` (all profiles) + on Vercel (prod + preview).
4. Set the mail `recipient` in `seed-contact-form.php` to the client's actual inbox
   before running (defaults to the agency address for internal/demo sites).
5. Verify: `curl -X POST <wp-origin>/wp-json/contact-form-7/v1/contact-forms/<id>/feedback -F ...`
   → `"status":"mail_sent"`.

## Swapping to a CRM

If a client needs leads in HubSpot/Zoho instead of (or as well as) email, replace the
body of `deliverEnquiry()` in `src/blocks/contact-form/action.ts` — the validation,
spam guards, and retryable-error UX stay the same either way.
