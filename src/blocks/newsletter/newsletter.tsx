import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import { NewsletterForm } from "./newsletter-form";
import type { NewsletterProps } from "./schema";

export function Newsletter({
  heading,
  intro,
  placeholder,
  button_label,
  success_message,
  tone,
  spacing,
  container,
}: NewsletterProps) {
  return (
    <Section dataBlock="newsletter" {...sectionProps({ tone, spacing, container: container ?? "narrow" })}>
      <div className="mx-auto max-w-xl text-center">
        {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
        {intro ? (
          <p className="mx-auto mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p>
        ) : null}
        <div className="mt-8 text-left">
          <NewsletterForm
            placeholder={placeholder}
            buttonLabel={button_label}
            successMessage={success_message}
          />
        </div>
      </div>
    </Section>
  );
}
