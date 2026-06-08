// FRAMEWORK primitive — no CMS knowledge, no client-specific values.
// Padding: KB 09 non-negotiable — px-4 md:px-8 lg:px-16.

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-16">{children}</div>;
}
