import { cn } from "@/lib/utils";

// Primitive — loading placeholder. Shape via className (h-*, w-*, rounded-*).

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[--radius-card] bg-muted",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
