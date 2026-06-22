import { ExternalLink } from "lucide-react";
import { Button } from "@/ui/button";
import type { ProductDetail } from "@/lib/commerce/products";

// External/Affiliate buy action — an OUTBOUND link (no cart). rel="sponsored nofollow" is the correct
// SEO signal for an affiliate/paid outbound product link. Shared by the PDP buy-box + the quick-view.
export function ExternalBuy({ product, className }: { product: ProductDetail; className?: string }) {
  if (!product.externalUrl) return null;
  return (
    <div className={className}>
      <Button asChild size="md" className="w-full">
        <a href={product.externalUrl} target="_blank" rel="sponsored nofollow noopener noreferrer">
          {product.externalButtonText || "Buy now"}
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </Button>
      <p className="mt-2 body-sm text-muted-foreground">
        You&apos;ll complete your purchase on the retailer&apos;s website (opens in a new tab).
      </p>
    </div>
  );
}
