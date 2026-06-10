import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/ui/button";
import { cn } from "@/lib/utils";

// FRAMEWORK primitive — a next/link styled as the shadcn Button (ADR 0012). Semantic via
// the bridge tokens; no CMS knowledge. For an actual <button>, use Button directly.
type Variant = VariantProps<typeof buttonVariants>["variant"];
type Size = VariantProps<typeof buttonVariants>["size"];

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({ href, variant = "default", size = "lg", className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}
