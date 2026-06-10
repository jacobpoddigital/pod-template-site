import { Section } from "@/ui/section";
import type { LogoStripProps } from "./schema";

// Text placeholders for now — swap to <Image> logos when assets land (keep alt = name).
export function LogoStrip({ heading, logos, tone }: LogoStripProps) {
  const items = Array.isArray(logos) ? logos : [];
  if (items.length === 0) return null;
  return (
    <Section dataBlock="logo_strip" tone={tone ?? "muted"} padding="compact">
      {heading ? (
        <p className="mb-8 text-center label text-ink-muted">{heading}</p>
      ) : null}
      <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {items.map((l) => (
          <li key={l.name} className="text-lg font-semibold text-ink-muted">
            {l.name}
          </li>
        ))}
      </ul>
    </Section>
  );
}
