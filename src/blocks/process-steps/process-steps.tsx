import { Container } from "@/ui/container";
import { Heading } from "@/ui/heading";
import type { ProcessStepsProps } from "./schema";

export function ProcessSteps({ heading, steps }: ProcessStepsProps) {
  const items = Array.isArray(steps) ? steps : [];
  if (items.length === 0) return null;
  return (
    <section id="how-it-works" className="bg-surface-muted py-section">
      <Container>
        {heading ? (
          <div className="mb-12 text-center">
            <Heading level={2}>{heading}</Heading>
          </div>
        ) : null}
        <ol className="grid gap-8 sm:grid-cols-3">
          {items.map((step, index) => (
            <li key={step.title} className="rounded-card bg-surface p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-button bg-brand font-bold text-on-brand">
                {index + 1}
              </span>
              <div className="mt-4">
                <Heading level={3}>{step.title}</Heading>
                {step.body ? <p className="mt-3 text-ink-muted">{step.body}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
