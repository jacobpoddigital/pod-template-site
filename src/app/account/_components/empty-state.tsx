import { ButtonLink } from "@/ui/button-link";

// Reusable empty state for account sub-sections (no orders / no downloads / no saved address).
export function EmptyState({ icon, title, body, cta }: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-8 text-center">
      {icon ? <div className="mx-auto mb-3 flex size-10 items-center justify-center text-muted-foreground">{icon}</div> : null}
      <p className="display-xs text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md body-sm text-muted-foreground">{body}</p>
      {cta ? (
        <ButtonLink href={cta.href} className="mt-5">
          {cta.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}
