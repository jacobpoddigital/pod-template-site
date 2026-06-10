import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Primitive — no CMS knowledge. Semantic tokens only.
// asChild: renders as its child element (e.g. <Link>) via Radix Slot — for navigation use ButtonLink instead.

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold outline-none " +
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
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
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
