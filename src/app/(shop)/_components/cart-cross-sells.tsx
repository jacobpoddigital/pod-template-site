import { Slider, SliderItem } from "@/ui/slider";
import { ProductCard } from "@/app/(shop)/shop/_components/product-card";
import type { ProductCard as ProductCardData } from "@/lib/commerce/products";

// Cart cross-sell rail (the cart-display sibling of the PDP up-sell rail) — merchant-curated
// "add this too" products for what's in the bag. Reuses the LOCKED ProductCard + ui/slider, the
// same pattern as the PDP "You may also like" rail (feedback-reuse-template-patterns). Used on the
// full /cart page; the narrow mini-cart drawer renders a compact row list instead (boundary: the
// header in src/layout can't import the app-level ProductCard).
export function CartCrossSells({ products }: { products: ProductCardData[] }) {
  if (!products.length) return null;
  return (
    <section aria-label="Recommended with your bag" className="mt-12 border-t border-border pt-10">
      <h2 className="display-sm text-foreground">You might also need</h2>
      <div className="mt-6">
        <Slider label="You might also need">
          {products.map((card) => (
            <SliderItem key={card.slug}>
              <ProductCard product={card} />
            </SliderItem>
          ))}
        </Slider>
      </div>
    </section>
  );
}
