import { cn } from "@/lib/utils";
import { Eyebrow } from "@/ui/eyebrow";

// The standard section header (eyebrow · h2 · intro). Extracted so blocks don't each re-implement it
// AND to keep block-component cyclomatic complexity down. Renders nothing when all three are empty.
export function SectionHeader({
  eyebrow,
  heading,
  intro,
  className,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
  className?: string;
}) {
  if (!eyebrow && !heading && !intro) return null;
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {heading ? <h2 className="display-md text-ink">{heading}</h2> : null}
      {intro ? <p className="mt-4 max-w-[min(65ch,90vw)] body-lg text-ink-muted">{intro}</p> : null}
    </div>
  );
}
