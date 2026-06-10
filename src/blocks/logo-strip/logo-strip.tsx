import { Container } from "@/ui/container";
import type { LogoStripProps } from "./schema";

// Text placeholders for now — swap to <Image> logos when assets land (keep alt = name).
export function LogoStrip({ heading, logos }: LogoStripProps) {
  const items = Array.isArray(logos) ? logos : [];
  if (items.length === 0) return null;
  return (
    <section data-block="logo_strip" className="bg-surface-muted py-12 md:py-16">
      <Container>
        {heading ? (
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">{heading}</p>
        ) : null}
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {items.map((l) => (
            <li key={l.name} className="text-lg font-semibold text-ink-muted">
              {l.name}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
