import { Section } from "@/ui/section";
import { RichText as Prose } from "@/ui/rich-text";
import { sectionProps, columnsClass } from "@/lib/section-settings";
import type { ColumnsProps } from "./schema";

export function Columns({ heading, intro, column_count, column_items, tone, spacing, container }: ColumnsProps) {
  const items = Array.isArray(column_items) ? column_items : [];
  if (items.length === 0) return null;

  return (
    <Section dataBlock="columns" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{intro}</p> : null}
        </div>
      ) : null}

      <div className={`grid gap-8 lg:gap-12 ${columnsClass(column_count ?? items.length)}`}>
        {items.map((col, i) => (
          <Prose key={i} html={col.content} className="max-w-none" />
        ))}
      </div>
    </Section>
  );
}
