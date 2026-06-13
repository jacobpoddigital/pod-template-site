import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Primitive — no CMS knowledge. Semantic tokens only.
// asChild: renders as its child element (e.g. <Link>) via Radix Slot — for navigation use ButtonLink instead.

const buttonVariants = cva(
  "group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold outline-none " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "motion-safe:transition-all " +
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:     "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:   "bg-secondary text-primary hover:bg-primary hover:text-primary-foreground",
        accent:      "bg-brand-accent text-brand-accent-foreground hover:bg-brand-accent/90",
        ghost:       "bg-transparent text-foreground hover:bg-muted",
        destructive: "bg-destructive text-white hover:opacity-90",
        outline:     "border border-border bg-transparent text-foreground hover:bg-muted",
      },
      size: {
        // WCAG 2.5.5 — 44px min touch target (h-11). sm is the compact affordance.
        // Size class lives per-variant (not the base) so lg's body doesn't clash with body-sm.
        sm: "h-10 px-3 body-sm",
        md: "h-11 px-4 body-sm",
        lg: "h-12 px-6 body",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

// Render a button icon from the icon library (NEVER a keyboard glyph — standards §11).
// A trailing icon slides on hover. Used by both Button and ButtonLink.
export function ButtonIcon({ icon: Icon, position }: { icon: LucideIcon; position: "leading" | "trailing" }) {
  return (
    <Icon
      aria-hidden
      className={cn(
        "size-[1.1em] shrink-0",
        position === "trailing" && "motion-safe:transition-transform motion-safe:group-hover/btn:translate-x-0.5",
      )}
    />
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** A lucide icon to render with the label (e.g. ArrowRight, Download, Phone). Default: none. */
  icon?: LucideIcon | null;
  iconPosition?: "leading" | "trailing";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon: Icon, iconPosition = "trailing", children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
        {/* Slot (asChild) requires a single child — never inject an icon there. */}
        {asChild ? (
          children
        ) : (
          <>
            {Icon && iconPosition === "leading" ? <ButtonIcon icon={Icon} position="leading" /> : null}
            {children}
            {Icon && iconPosition === "trailing" ? <ButtonIcon icon={Icon} position="trailing" /> : null}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
