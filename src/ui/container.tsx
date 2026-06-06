// FRAMEWORK primitive — no CMS knowledge, no client-specific values (workflow/02).

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-6">{children}</div>;
}
