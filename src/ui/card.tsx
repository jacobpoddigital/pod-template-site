import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Primitive — no CMS knowledge.
//
// Variant axes (the shared card vocabulary every card block draws from — roadmap
// Tier 0). Defaults reproduce the original `rounded-lg border bg-card shadow-sm`
// exactly, so blocks that don't opt in are unchanged.
//   elevation   — flat | shadow (default) | outline
//   emphasis    — default | featured (the "most popular" / highlighted treatment)
//   interaction — static (default) | link (whole-card clickable; pair with a
//                 stretched <a className="after:absolute after:inset-0"> inside)
const cardVariants = cva("rounded-lg text-card-foreground", {
  variants: {
    elevation: {
      flat: "border bg-card",
      shadow: "border bg-card shadow-sm",
      outline: "border-2 border-border bg-card",
    },
    emphasis: {
      default: "",
      featured: "border-primary ring-2 ring-primary",
    },
    interaction: {
      static: "",
      // `group` + focus-within ring lets a stretched child link drive hover/focus
      link: "group relative motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
    },
  },
  defaultVariants: {
    elevation: "shadow",
    emphasis: "default",
    interaction: "static",
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation, emphasis, interaction, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ elevation, emphasis, interaction }),
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// A semantic heading (h3) — card titles sit under a section's h2 (a11y hierarchy).
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("display-xs", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("body-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
}
