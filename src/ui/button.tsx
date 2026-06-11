import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Primitive — no CMS knowledge. Semantic tokens only.
// asChild: renders as its child element (e.g. <Link>) via Radix Slot — for navigation use ButtonLink instead.

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold outline-none " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "motion-safe:transition-colors " +
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
