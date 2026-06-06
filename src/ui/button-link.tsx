import Link from "next/link";

// FRAMEWORK primitive — no CMS knowledge. Semantic tokens only (ADR 0004).

const variants = {
  primary: "bg-brand text-on-brand hover:bg-brand-dark",
  secondary: "bg-brand-light text-brand hover:bg-brand hover:text-on-brand",
} as const;

interface ButtonLinkProps {
  href: string;
  variant?: keyof typeof variants;
  children: React.ReactNode;
}

export function ButtonLink({ href, variant = "primary", children }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-block rounded-button px-6 py-3 font-semibold transition-colors ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}
