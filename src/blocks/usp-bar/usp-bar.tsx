import Image from "next/image";
import Link from "next/link";
import { Section } from "@/ui/section";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { UspBarProps } from "./schema";

export function UspBar({ columns, items, tone, spacing, container }: UspBarProps) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;
  const cols = columnsClass(columns ?? Math.min(list.length, 4));

  return (
    <Section dataBlock="usp_bar" {...sectionProps({ tone, spacing: spacing ?? "compact", container })}>
      <ul className={`grid gap-6 ${cols}`}>
        {list.map((item, i) => {
          const row = (
            <span className="flex items-center gap-3">
              {item.image?.sourceUrl ? (
                <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center">
                  <Image src={item.image.sourceUrl} alt={item.image.altText ?? ""} fill sizes="40px" className="object-contain" />
                </span>
              ) : null}
              <span className="body font-medium text-ink">{item.text}</span>
            </span>
          );
          return (
            <li key={`${item.text}-${i}`}>
              {item.link_url ? (
                <Link href={item.link_url} className="inline-flex rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
