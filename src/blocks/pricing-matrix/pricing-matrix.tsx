import { Section } from "@/ui/section";
import { RichText } from "@/ui/rich-text";
import { SectionActions } from "@/ui/section-actions";
import { SectionHeader } from "@/ui/section-header";
import { sectionProps } from "@/lib/section-settings";
import type { PricingMatrixProps } from "./schema";

type Row = NonNullable<PricingMatrixProps["rows"]>[number];

function cellValue(row: Row, i: number): string | null | undefined {
  return [row.value1, row.value2, row.value3][i];
}

export function PricingMatrix({
  heading,
  intro,
  eyebrow,
  footnote,
  cta_label,
  cta_url,
  secondary_label,
  secondary_url,
  plan_labels,
  rows,
  tone,
  spacing,
  container,
}: PricingMatrixProps) {
  const plans = (Array.isArray(plan_labels) ? plan_labels : []).slice(0, 3);
  const body = Array.isArray(rows) ? rows : [];
  if (plans.length === 0 || body.length === 0) return null;

  return (
    <Section dataBlock="pricing_matrix" {...sectionProps({ tone, spacing, container })}>
      <SectionHeader eyebrow={eyebrow} heading={heading} intro={intro} className="mb-10" />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-3 pr-4 label text-ink-muted">Feature</th>
              {plans.map((p, i) => (
                <th key={`${p.label}-${i}`} scope="col" className="py-3 px-4 label text-ink">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, r) => (
              <tr key={`${row.feature}-${r}`} className="border-b border-border">
                <th scope="row" className="py-3 pr-4 body-sm font-medium text-ink">
                  {row.feature}
                </th>
                {plans.map((p, i) => (
                  <td key={`${p.label}-${i}`} className="py-3 px-4 body-sm text-ink-muted">
                    {cellValue(row, i) ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SectionActions cta_label={cta_label} cta_url={cta_url} secondary_label={secondary_label} secondary_url={secondary_url} />
      {footnote ? <RichText html={footnote} className="mt-8 body-sm text-ink-muted" /> : null}
    </Section>
  );
}
