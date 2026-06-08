import Link from "next/link";
import { buttonVariants } from "@/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

// FRAMEWORK primitive — no CMS knowledge. Delegates variant logic to buttonVariants.

interface ButtonLinkProps extends VariantProps<typeof buttonVariants> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ButtonLink({ href, variant = "primary", size = "md", children, className }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}
