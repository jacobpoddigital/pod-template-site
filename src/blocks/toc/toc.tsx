import { Section } from "@/ui/section";
import { sectionProps, toAnchorId } from "@/lib/section-settings";
import type { TocProps } from "./schema";

export function Toc({ heading, items, tone, spacing, container }: TocProps) {
  const links = Array.isArray(items) ? items : [];
  if (links.length === 0) return null;

  return (
    <Section dataBlock="toc" {...sectionProps({ tone, spacing, container: container ?? "narrow" })}>
      <nav aria-label={heading || "On this page"} className="rounded-card border border-border p-6">
        {heading ? <h2 className="label text-ink-muted">{heading}</h2> : null}
        <ul className="mt-3 flex flex-col gap-2">
          {links.map((l, i) => (
            <li key={`${l.target}-${i}`}>
              <a
                href={`#${toAnchorId(l.target)}`}
                className="inline-flex min-h-11 items-center body text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Section>
  );
}
