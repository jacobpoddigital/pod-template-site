import Link from "next/link";

// FRAMEWORK primitive — no CMS knowledge. Semantic tokens only.

const variants = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "bg-accent-surface text-accent hover:bg-accent hover:text-on-accent",
} as const;

interface ButtonLinkProps {
  href: string;
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}

export function ButtonLink({ href, variant = "primary", children, className = "" }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-block rounded-button px-6 py-3 font-semibold outline-none motion-safe:transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
