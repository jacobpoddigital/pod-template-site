import { Check } from "lucide-react";
import { Section } from "@/ui/section";
import type { ProductDetail } from "@/lib/commerce/products";
import { cushionPct, dropMm, DROP_MAX_MM, dropContext } from "./specs";

// P5 — technical specification. Real catalogue attributes only (honest POC; no invented stack
// heights / midsole foams). Cushioning + drop rendered as visual bars so non-runners get the
// context the brief's "digital specialist adviser" promises.

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5">
      <dt className="body-sm text-muted-foreground">{label}</dt>
      <dd className="body-sm font-medium text-foreground text-right">{value}</dd>
    </div>
  );
}

function Bar({ pct }: { pct: number }) {
  // Visible neutral track (bg-surface-muted blends into the muted section) so the full scale + the
  // unfilled remainder read clearly; brand-lime fill marks the value.
  return (
    <div className="h-2.5 overflow-hidden rounded-full border border-border bg-foreground/10" aria-hidden="true">
      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

// Pronation suitability rows, keyed off the shoe's support type.
function pronationRows(pronation: string | null): { label: string; verdict: string; tone: "best" | "ok" | "no" }[] {
  const p = (pronation ?? "Neutral").toLowerCase();
  if (p.includes("motion")) {
    return [
      { label: "Moderate–severe overpronation", verdict: "Best match", tone: "best" },
      { label: "Mild overpronation", verdict: "Suitable", tone: "ok" },
      { label: "Neutral gait", verdict: "Not recommended", tone: "no" },
    ];
  }
  if (p.includes("stability") || p.includes("support")) {
    return [
      { label: "Mild–moderate overpronation", verdict: "Best match", tone: "best" },
      { label: "Neutral gait", verdict: "Suitable", tone: "ok" },
      { label: "Severe overpronation", verdict: "Consider motion control", tone: "no" },
    ];
  }
  return [
    { label: "Neutral gait", verdict: "Best match", tone: "best" },
    { label: "Mild overpronation", verdict: "Suitable", tone: "ok" },
    { label: "Moderate–severe overpronation", verdict: "Consider a stability shoe", tone: "no" },
  ];
}

const VERDICT_ICON: Record<"best" | "ok" | "no", string> = { best: "✓", ok: "~", no: "✗" };

function buildSpecRows(product: ProductDetail): { label: string; value: string }[] {
  const type = product.categories[0]?.name;
  return [
    product.drop && { label: "Heel-to-toe drop", value: product.drop },
    product.weightGrams && { label: "Weight", value: `${product.weightGrams}g` },
    product.cushioning && { label: "Cushioning", value: product.cushioning },
    product.pronation && { label: "Support", value: product.pronation },
    type && { label: "Category", value: type },
    product.brand && { label: "Brand", value: product.brand },
    product.widths.length > 0 && { label: "Widths available", value: product.widths.join(", ") },
    product.colours.length > 0 && { label: "Colours", value: product.colours.join(", ") },
  ].filter(Boolean) as { label: string; value: string }[];
}

function cushionNote(pct: number): string {
  if (pct >= 70) return "This shoe sits toward the maximum end of the spectrum — ideal for daily mileage and recovery runs on hard surfaces.";
  if (pct >= 50) return "This shoe sits in the balanced middle of the spectrum — a versatile feel for everyday training.";
  return "This shoe sits toward the firmer end of the spectrum — a closer ground-feel for faster running.";
}

export function SpecSection({ product }: { product: ProductDetail }) {
  const cushion = cushionPct(product.cushioning);
  const mm = dropMm(product.drop);
  const rows = buildSpecRows(product);

  return (
    <Section dataBlock="pdp_specs" tone="muted" padding="default">
      <h2 className="display-sm text-foreground">Technical specification</h2>
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <dl>
          {rows.map((r) => (
            <SpecRow key={r.label} label={r.label} value={r.value} />
          ))}
        </dl>

        <div className="flex flex-col gap-8">
          {cushion != null && (
            <div>
              <h3 className="display-xs text-foreground">Cushioning level</h3>
              <div className="mt-2 flex justify-between body-sm text-muted-foreground">
                <span>Minimal</span>
                <span>Maximum</span>
              </div>
              <div className="mt-1.5">
                <Bar pct={cushion} />
              </div>
              <p className="mt-2 body-sm text-muted-foreground max-w-[60ch]">{cushionNote(cushion)}</p>
            </div>
          )}

          {mm != null && (
            <div>
              <h3 className="display-xs text-foreground">What {product.drop} drop means for you</h3>
              <div className="mt-2 flex justify-between body-sm text-muted-foreground">
                <span>0mm (zero drop)</span>
                <span>{DROP_MAX_MM}mm (high)</span>
              </div>
              <div className="mt-1.5">
                <Bar pct={Math.min(100, (mm / DROP_MAX_MM) * 100)} />
              </div>
              <p className="mt-2 body-sm text-muted-foreground max-w-[60ch]">{dropContext(mm)}</p>
            </div>
          )}

          <div>
            <h3 className="display-xs text-foreground">Pronation suitability</h3>
            <ul className="mt-2 flex flex-col gap-px overflow-hidden rounded-md">
              {pronationRows(product.pronation).map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 bg-surface-raised px-4 py-2.5 body-sm"
                >
                  <span className="inline-flex items-center gap-2 text-foreground">
                    {row.tone === "best" ? (
                      <Check className="size-4 text-success" aria-hidden="true" />
                    ) : (
                      <span aria-hidden="true" className="w-4 text-center text-muted-foreground">{VERDICT_ICON[row.tone]}</span>
                    )}
                    {row.label}
                  </span>
                  <span className={row.tone === "best" ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {row.verdict}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
