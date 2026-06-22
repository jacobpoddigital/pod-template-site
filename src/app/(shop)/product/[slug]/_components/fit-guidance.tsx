import Link from "next/link";
import { Check, X } from "lucide-react";
import { Section } from "@/ui/section";
import type { ProductDetail } from "@/lib/commerce/products";
import { dropMm } from "./specs";
import { siteConfig } from "../../../../../../site.config";

// P6 — inline fit guidance: the "digital specialist adviser" moment. Plain-English Yes/No
// criteria derived from the shoe's real attributes — kills fit-anxiety before the bag.

type FitFlags = { isTrail: boolean; isRace: boolean; isStability: boolean; cushion: string; mm: number | null };

function fitFlags(product: ProductDetail): FitFlags {
  const type = (product.categories[0]?.name ?? "running").toLowerCase();
  const support = (product.pronation ?? "Neutral").toLowerCase();
  return {
    isTrail: type.includes("trail"),
    isRace: type.includes("racing"),
    isStability: support.includes("stability") || support.includes("motion"),
    cushion: (product.cushioning ?? "").toLowerCase(),
    mm: dropMm(product.drop),
  };
}

function cushionSuitsLine(f: FitFlags): string {
  if (f.cushion.includes("maximum")) return "You prioritise cushioning and comfort on easy and long runs";
  if (f.cushion.includes("responsive") || f.isRace) return "You want a light, fast, propulsive ride for tempo and racing";
  return "You want a versatile do-it-all ride for everyday miles";
}

function suitsBullets(product: ProductDetail, f: FitFlags): string[] {
  const out = [
    f.isTrail ? "You run off-road on trails, mud or technical ground" : "You run primarily on road, pavement or treadmill",
    f.isStability ? "Your gait overpronates and you want guided support" : "Your gait is neutral or only mildly overpronating",
    cushionSuitsLine(f),
  ];
  if (f.mm != null) out.push(`You're comfortable with a ${product.drop} heel-to-toe drop`);
  return out;
}

function considerBullets(f: FitFlags): string[] {
  const lowDrop = f.cushion.includes("minimal") || (f.mm != null && f.mm <= 4);
  return [
    f.isRace ? "You want a cushioned shoe for high-mileage easy days" : "You want a dedicated race-day or speed-session shoe",
    f.isStability ? "You have a neutral gait and prefer an unstructured feel" : "You overpronate severely and need motion-control support",
    lowDrop ? "You prefer a high-drop, heavily cushioned trainer" : "You prefer a zero-drop or minimal-cushion shoe",
  ];
}

function fitSummary(product: ProductDetail, f: FitFlags): string {
  const who = f.isStability ? "runners who overpronate" : "neutral-gait runners";
  const want = f.cushion.includes("maximum") ? "plush cushioning over ground-feel" : f.isRace ? "a light, fast ride" : "a dependable everyday ride";
  const where = f.isTrail ? "trails and technical terrain" : "road and pavement";
  return `The ${product.name} is built for ${who} who want ${want} on ${where}.`;
}

function deriveFit(product: ProductDetail): { suits: string[]; consider: string[]; summary: string } {
  const f = fitFlags(product);
  return { suits: suitsBullets(product, f), consider: considerBullets(f), summary: fitSummary(product, f) };
}

export function FitGuidance({ product }: { product: ProductDetail }) {
  const { suits, consider, summary } = deriveFit(product);
  const widthNote =
    product.widths.length > 1
      ? `Available in ${product.widths.join(" and ")} — wide-fitters should choose the wider option or go half a size up.`
      : "Runners between sizes should size up for a comfortable fit.";

  return (
    <Section dataBlock="pdp_fit_guidance" tone="muted" padding="default">
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
        <div>
          <h2 className="display-sm text-foreground">Is the {product.name} right for your running?</h2>
          <p className="mt-4 body text-muted-foreground max-w-[60ch]">{summary}</p>

          <div className="mt-8">
            <h3 className="display-xs text-foreground">This shoe suits you if</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {suits.map((s) => (
                <li key={s} className="flex items-start gap-2.5 body text-foreground">
                  <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="display-xs text-foreground">Consider an alternative if</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {consider.map((c) => (
                <li key={c} className="flex items-start gap-2.5 body text-muted-foreground">
                  <X className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/fit-guide"
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 body-sm font-semibold text-foreground transition-colors motion-safe:duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Full fit guide — find your perfect shoe →
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-surface-muted p-6">
          <h3 className="display-xs text-foreground">Sizing — how does it fit?</h3>
          <dl className="mt-4 flex flex-col gap-px overflow-hidden rounded-md">
            <div className="flex justify-between gap-4 bg-surface px-4 py-3 body-sm">
              <dt className="text-muted-foreground">Fit</dt>
              <dd className="font-medium text-foreground">True to size</dd>
            </div>
            <div className="flex justify-between gap-4 bg-surface px-4 py-3 body-sm">
              <dt className="text-muted-foreground">Widths</dt>
              <dd className="font-medium text-foreground">{product.widths.length ? product.widths.join(", ") : "Standard"}</dd>
            </div>
          </dl>
          <p className="mt-4 body-sm text-muted-foreground max-w-[55ch]">{widthNote}</p>
          {product.reviewCount ? (
            <p className="mt-2 body-sm text-muted-foreground">
              — {siteConfig.name} fit note, based on {product.reviewCount} customer reviews
            </p>
          ) : null}
        </div>
      </div>
      </div>
    </Section>
  );
}
