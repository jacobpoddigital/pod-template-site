import Link from "next/link";
import { Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

// Cart fit/size-confidence reassurance — the wireframe directive "kill fit-anxiety before the cart"
// (C-page "Size confidence before you check out"). A low-key nudge to the fit guide + the free-exchange
// safety net, shown on both cart surfaces. (Footwear-specific copy; generalise/configure at M5.)
export function FitReassurance({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-2 rounded-md border border-border bg-surface-raised p-3", className)}>
      <Ruler className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="body-sm text-muted-foreground">
        Not sure on size?{" "}
        <Link
          href="/fit-guide"
          className="font-medium text-link underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Check the fit guide
        </Link>{" "}
        before checkout — free exchanges if it&apos;s not right.
      </p>
    </div>
  );
}
