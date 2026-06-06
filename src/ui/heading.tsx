// FRAMEWORK primitive — no CMS knowledge, no client-specific values (workflow/02).

const levels = {
  1: "text-4xl font-bold tracking-tight sm:text-5xl",
  2: "text-3xl font-bold tracking-tight",
  3: "text-xl font-semibold",
} as const;

interface HeadingProps {
  level: keyof typeof levels;
  children: React.ReactNode;
}

export function Heading({ level, children }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={levels[level]}>{children}</Tag>;
}
