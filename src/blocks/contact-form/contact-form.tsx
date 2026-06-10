import { Section } from "@/ui/section";
import { ContactForm } from "./form";
import type { ContactFormProps } from "./schema";

export function ContactFormBlock({ heading, intro, submit_label, success_message, tone }: ContactFormProps) {
  return (
    <Section dataBlock="contact_form" tone={tone}>
      <div className="mx-auto max-w-xl">
        {heading ? <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{heading}</h2> : null}
        {intro ? <p className="mb-8 mt-3 max-w-[65ch] text-lg leading-relaxed text-ink-muted">{intro}</p> : null}
        <ContactForm
          submitLabel={submit_label ?? "Send enquiry"}
          successMessage={success_message ?? "Thanks — we'll be in touch shortly."}
        />
      </div>
    </Section>
  );
}
