import { Section } from "@/ui/section";
import { ContactForm } from "./form";
import { sectionProps } from "@/lib/section-settings";
import type { ContactFormProps } from "./schema";

export function ContactFormBlock({ heading, intro, submit_label, success_message, tone, spacing, container }: ContactFormProps) {
  return (
    <Section dataBlock="contact_form" {...sectionProps({ tone, spacing, container })}>
      <div className="mx-auto max-w-xl">
        {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
        {intro ? <p className="mb-8 mt-3 max-w-[65ch] body-lg text-ink-muted">{intro}</p> : null}
        <ContactForm
          submitLabel={submit_label ?? "Send enquiry"}
          successMessage={success_message ?? "Thanks — we'll be in touch shortly."}
        />
      </div>
    </Section>
  );
}
