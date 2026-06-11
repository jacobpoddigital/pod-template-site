import { Section } from "@/ui/section";
import { sectionProps } from "@/lib/section-settings";
import type { ComparisonTableProps } from "./schema";

export function ComparisonTable({
  heading,
  intro,
  option_a_label,
  option_b_label,
  rows,
  tone,
  spacing,
  container,
}: ComparisonTableProps) {
  const items = Array.isArray(rows) ? rows : [];
  if (items.length === 0) return null;
  const aLabel = option_a_label || "Option A";
  const bLabel = option_b_label || "Option B";

  return (
    <Section dataBlock="comparison_table" {...sectionProps({ tone, spacing, container })}>
      {heading || intro ? (
        <div className="mb-12 max-w-2xl">
          {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
          {intro ? <p className="mt-4 max-w-[65ch] body-lg text-ink-muted">{intro}</p> : null}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-3 pr-4 font-semibold text-ink">Feature</th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">{aLabel}</th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">{bLabel}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={i} className="border-b border-border">
                <th scope="row" className="py-3 pr-4 font-medium text-ink">{r.feature}</th>
                <td className="px-4 py-3 text-ink-muted">{r.option_a}</td>
                <td className="px-4 py-3 text-ink-muted">{r.option_b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
