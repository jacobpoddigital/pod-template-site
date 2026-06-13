import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonVariants, ButtonIcon } from "@/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

// FRAMEWORK primitive — no CMS knowledge. Delegates variant + icon logic to button.tsx.

interface ButtonLinkProps extends VariantProps<typeof buttonVariants> {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** A lucide icon to render with the label (e.g. ArrowRight, Download, Phone). Default: none. */
  icon?: LucideIcon | null;
  iconPosition?: "leading" | "trailing";
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "trailing",
  children,
  className,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {Icon && iconPosition === "leading" ? <ButtonIcon icon={Icon} position="leading" /> : null}
      {children}
      {Icon && iconPosition === "trailing" ? <ButtonIcon icon={Icon} position="trailing" /> : null}
    </Link>
  );
}
