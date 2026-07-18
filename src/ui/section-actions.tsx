import { ButtonLink } from "@/ui/button-link";
import { cn } from "@/lib/utils";

// The generic section-level CTA row: up to two buttons (primary + ghost secondary) at the
// bottom of any section block (workflow/29 rule 9 — every section may carry two buttons).
// Renders nothing when no primary label/url is set, so it's a zero-cost opt-in slot.
export function SectionActions({
  cta_label,
  cta_url,
  secondary_label,
  secondary_url,
  className,
}: {
  cta_label?: string | null;
  cta_url?: string | null;
  secondary_label?: string | null;
  secondary_url?: string | null;
  className?: string;
}) {
  const primary = cta_label && cta_url;
  const secondary = secondary_label && secondary_url;
  if (!primary && !secondary) return null;
  return (
    <div className={cn("mt-10 flex flex-wrap items-center gap-4", className)}>
      {primary ? <ButtonLink href={cta_url!}>{cta_label}</ButtonLink> : null}
      {secondary ? (
        <ButtonLink href={secondary_url!} variant="ghost">
          {secondary_label}
        </ButtonLink>
      ) : null}
    </div>
  );
}
