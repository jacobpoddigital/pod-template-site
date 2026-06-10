import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Primitive — no CMS knowledge. Semantic tokens only.
// asChild: renders as its child element (e.g. <Link>) via Radix Slot — for navigation use ButtonLink instead.

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[--radius-button] text-sm font-semibold outline-none " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "motion-safe:transition-colors " +
  "focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:     "bg-[--color-primary] text-[--color-on-accent] hover:bg-[--color-accent-hover]",
        secondary:   "bg-[--color-accent-surface] text-[--color-primary] hover:bg-[--color-primary] hover:text-[--color-on-accent]",
        ghost:       "bg-transparent text-[--color-ink] hover:bg-[--color-surface-muted]",
        destructive: "bg-[--destructive] text-[--destructive-foreground] hover:opacity-90",
        outline:     "border border-[--color-border] bg-transparent text-[--color-ink] hover:bg-[--color-surface-muted]",
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
